const content = require('../data/content');
const logger = require('../log');
const url = require('url');
const {
    objectKeysInArray,
    itemsInQueryString
} = require('./helpers/formHelpers');
const subjectData = require('../data/subject');
const pdf = require('./helpers/pdfHelpers');

const availablePrintOptions = {
    summary: {
        title: 'Summary',
        addContent: pdf.summaryContent,
        getData: subjectData.getSubject
    },
    movements: {
        title: 'Movements',
        addContent: pdf.movementContent,
        getData: subjectData.getMovements
    },
    hdc: {
        title: 'HDC history',
        addContent: pdf.hdcContent,
        getData: subjectData.getHDCInfo
    },
    offences: {
        title: 'Offences',
        addContent: pdf.offenceContent,
        getData: subjectData.getOffences
    },
    custodyOffences: {
        title: 'Offences in custody',
        addContent: pdf.custodyOffenceContent,
        getData: subjectData.getAdjudications
    },
    addresses: {
        title: 'Addresses',
        addContent: pdf.addressContent,
        getData: subjectData.getAddresses
    }
};

exports.getPrintForm = (req, res) => {
    logger.debug('GET /print');
    const {prisonNo, err} = req.query;

    if(!prisonNo) return res.redirect('/search');
    renderFormPage(res, prisonNo, err);
};

function renderFormPage(res, prisonNo, err) {
    const renderData = {
        content: content.view.print,
        prisonNumber: prisonNo,
        name: null,
        err: err ? getDisplayError(err) : null
    };

    if(!err || err !== 'db') return getNameAndRender(res, renderData);
    renderWithoutName(res, renderData);
}

function getNameAndRender(res, renderData) {
    return subjectData.getSubject(renderData.prisonNumber)
        .then(subjectData => {

            renderData.name = {
                forename: subjectData.forename.trim(),
                surname: subjectData.surname.trim()
            };

            return res.render('print', renderData);
        })
        .catch(error => showDbError({error}, renderData.prisonNumber, res));
}

function renderWithoutName(res, renderData) {
    return res.render('print', renderData);
}

exports.postPrintForm = (req, res) => {
    logger.debug('POST /print');
    const userReturnedOptions = req.body.printOption;
    const prisonNo = req.query.prisonNo;

    if (!userReturnedOptions || userReturnedOptions.length === 0) {
        logger.warn('No print items selected');
        return renderFormPage(res, prisonNo, 'noneSelected');
    }

    const selectedOptions = objectKeysInArray(availablePrintOptions, userReturnedOptions);
    const query = {
        prisonNo: req.query.prisonNo,
        fields: selectedOptions
    };

    const redirectUrl = url.format({'pathname': '/print/pdf', query});
    return res.redirect(redirectUrl);
};

exports.getPdf = function(req, res) {

    const prisonNumber = req.query.prisonNo;
    if (!prisonNumber || !req.query.fields) return res.redirect('/search');

    const fieldsInQuery = Array.isArray(req.query.fields) ? req.query.fields : [req.query.fields];
    const printItems = itemsInQueryString(fieldsInQuery).filter(item => availablePrintOptions[item]);

    const dataFunctionsToCall = getDataFunctionsToCall(printItems);

    return Promise.all(dataFunctionsToCall.map(dataFunction => dataFunction(prisonNumber)))
        .then(data => {
            const {subjectData, subjectName} = extractSubjectInfo(data, printItems);
            pdf.createPdf(res, printItems, subjectData, availablePrintOptions, subjectName);
        })
        .catch(error => showDbError({error}, prisonNumber, res));
};

function getDataFunctionsToCall(printItems) {
    const itemsSelected = printItems.map(item => availablePrintOptions[item].getData);
    // we always need subject call to get name
    if(!itemsSelected.includes(availablePrintOptions.summary.getData)) {
        itemsSelected.unshift(availablePrintOptions.summary.getData);
    }

    return itemsSelected;
}

function extractSubjectInfo(data, printItems) {
    const subjectName = {
        forename: data[0].forename.trim(),
        surname: data[0].surname.trim(),
        prisonNumber: data[0].prisonNumber
    };
    const summaryNotSelected = data.length === printItems.length + 1;
    const subjectData = summaryNotSelected ? data.filter((item, index) => index !== 0) : data;

    return {subjectData, subjectName};
}

function showDbError(error, prisonNo, res) {
    logger.error('Error during data collection for pdf ', error);

    const query = {
        prisonNo,
        err: 'db'
    };
    const redirectUrl = url.format({'pathname': '/print', query});
    return res.redirect(redirectUrl);
}

function getDisplayError(type) {
    const error = {
        'db': {title: content.pdf.dbError.title, desc: content.pdf.dbError.desc},
        'noneSelected': {title: content.view.print.noneSelected}
    };

    return error[type];
}
