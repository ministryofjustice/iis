const content = require('../data/content');
const logger = require('../log');
const url = require('url');
const {
    objectKeysInArray,
    itemsInQueryString
} = require('./helpers/formHelpers');
const {getSubject} = require('../data/subject2');
const pdf = require('./helpers/pdfHelpers2');
const audit = require('../data/audit');

const availablePrintOptions = {
    summary: {
        title: 'Subject',
        addContent: pdf.subjectContent,
        getData: ['summary']
    },
    sentencing: {
        title: 'Sentence History',
        addContent: pdf.sentenceHistoryContent,
        getData: ['sentencing']
    },
    courtHearings: {
        title: 'Court Hearings',
        addContent: pdf.courtHearingsContent,
        getData: ['courtHearings']
    },
    movements: {
        title: 'Movements',
        addContent: pdf.movementContent,
        getData: ['movements']
    },
    hdc: {
        title: 'HDC history',
        addContent: pdf.hdcContent,
        getData: ['hdcRecall', 'hdcInfo']
    },
    offences: {
        title: 'Offences',
        addContent: pdf.offenceContent,
        getData: ['offences']
    },
    custodyOffences: {
        title: 'Offences in custody',
        addContent: pdf.custodyOffenceContent,
        getData: ['offencesInCustody']
    },
    addresses: {
        title: 'Addresses',
        addContent: pdf.addressContent,
        getData: ['addresses']
    }
};

exports.getPrintForm = (req, res) => {
    logger.debug('GET /print');
    const {prisonNo, err} = req.query;

    if(!prisonNo) return res.redirect('/search2');
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
    return getSubject(renderData.prisonNumber)
        .then(subject => {

            renderData.name = {
                forename: subject.summary.firstName,
                surname: subject.summary.lastName
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

    audit.record('PRINT', req.user.email, {prisonNo, fieldsPrinted: userReturnedOptions});

    if (!userReturnedOptions || userReturnedOptions.length === 0) {
        logger.warn('No print items selected');
        return renderFormPage(res, prisonNo, 'noneSelected');
    }

    const selectedOptions = objectKeysInArray(availablePrintOptions, userReturnedOptions);
    const query = {
        prisonNo: req.query.prisonNo,
        fields: selectedOptions
    };

    const redirectUrl = url.format({'pathname': '/print2/pdf', query});
    return res.redirect(redirectUrl);
};

exports.getPdf = function(req, res) {

    const prisonNumber = req.query.prisonNo;
    if (!prisonNumber || !req.query.fields) return res.redirect('/search2');

    const fieldsInQuery = Array.isArray(req.query.fields) ? req.query.fields : [req.query.fields];
    const printItems = itemsInQueryString(fieldsInQuery).filter(item => availablePrintOptions[item]);

    const dataFunctionsToCall = getDataFunctionsToCall(printItems);

    return getSubject(prisonNumber, dataFunctionsToCall.map(dataFunction => dataFunction))
        .then(data => {
            pdf.createPdf(res, printItems, data, availablePrintOptions, {type: 'searchPrint'})
        })
        .catch(error => {
            showDbError({error}, prisonNumber, res)
        });
};

const getDataFunctionsToCall = printItems => {
    const flattenedPrintItems = printItems.map(item => availablePrintOptions[item].getData)
                                          .reduce((a, b) => a.concat(b), []);

    return [...new Set(flattenedPrintItems)];
};

function showDbError(error, prisonNo, res) {

    console.error(error)

    logger.error('Error during data collection for pdf ', error);

    const query = {
        prisonNo,
        err: 'db'
    };
    const redirectUrl = url.format({'pathname': '/print2', query});
    return res.redirect(redirectUrl);
}

function getDisplayError(type) {
    const error = {
        'db': {title: content.pdf.dbError.title, desc: content.pdf.dbError.desc},
        'noneSelected': {title: content.view.print.noneSelected}
    };

    return error[type];
}
