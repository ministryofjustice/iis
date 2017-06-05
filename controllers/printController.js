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

    if(!req.query.prisonNo) {
        return res.redirect('/search');
    }

    return res.render('print', {
        content: content.view.print,
        prisonNumber: req.query.prisonNo
    });
};

exports.postPrintForm = (req, res) => {
    logger.debug('POST /print');
    const userReturnedOptions = req.body.printOption;

    const selectedOptions = objectKeysInArray(availablePrintOptions, userReturnedOptions);
    const query = {
        prisonNo: req.query.prisonNo,
        fields: selectedOptions
    };

    if (selectedOptions.length === 0) {
        logger.warn('No print items selected');
        return res.render('print', {content: content.view.print});
    }

    const redirectUrl = url.format({'pathname': '/print/pdf', query});
    return res.redirect(redirectUrl);
};

exports.getPdf = function(req, res) {

    if (!req.query.fields || !req.query.prisonNo) {
        logger.warn('No print items selected');
        return res.render('print', {
            content: content.view.print
        });
    }

    const prisonNumber = req.query.prisonNo;
    const printItems = itemsInQueryString(req.query.fields).filter(item => availablePrintOptions[item]);

    const dataFunctionsToCall = printItems.map(item => {
        return availablePrintOptions[item].getData;
    });

    if(!dataFunctionsToCall.includes(availablePrintOptions.summary.getData)) {
        dataFunctionsToCall.unshift(availablePrintOptions.summary.getData);
    }

    return Promise.all(dataFunctionsToCall.map(dataFunction => dataFunction(prisonNumber)))
        .then(data => {

            const {subjectData, subjectName} = extractSubjectInfo(data, printItems);

            pdf.createPdf(res, printItems, subjectData, availablePrintOptions, subjectName);

        })
        .catch(err => {
            logger.error('Error during data collection for pdf ', {err});

            const query = {prisonNo: prisonNumber};
            const redirectUrl = url.format({'pathname': '/print', query});
            return res.redirect(redirectUrl);
        });
};

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
