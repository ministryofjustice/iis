const PDFDocument = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
const content = require('../data/content');
const logger = require('../log');
const url = require('url');
const {
    objectKeysInArray,
    itemsInQueryString
} = require('./helpers/formHelpers');
const {
    getSubject,
    getMovements,
    getAliases,
    getAddresses,
    getOffences,
    getHDCInfo,
    getHDCRecall,
    getAdjudications
} = require('../data/subject');

const availablePrintOptions = {
    summary: {
        title: 'Summary',
        addContent: summaryContent,
        getData: getSubject,
        textMap: {
            prisonNumber: 'Prison number',
            personIdentifier: 'Person identifier',
            paroleRefList: 'Parole reference list',
            pnc: 'PNC',
            cro: 'CRO',
            dob: 'Date of birth',
            countryOfBirth: 'Country of birth',
            maritalStatus: 'Marital status',
            ethnicity: 'Ehnicity',
            nationality: 'Nationality',
            religion: 'Religion',
            sex: 'Gender',
            age: 'Age'
        }
    },
    movements: {
        title: 'Movements',
        addContent: movementContent,
        getData: getMovements
    },
    hdc: {
        title: 'HDC history',
        addContent: hdcContent,
        getData: getHDCInfo
    },
    offences: {
        title: 'Offences',
        addContent: offenceContent,
        getData: getOffences
    },
    custodyOffences: {
        title: 'Offences in custody',
        addContent: custodyOffenceContent,
        getData: getAdjudications
    },
    addresses: {
        title: 'Addresses',
        addContent: addressContent,
        getData: getAddresses
    }
};

exports.getPrintForm = (req, res) => {
    logger.debug('GET /print');

    if(!req.query.prisonNo) {
        return res.redirect('/search')
    }

    return res.render('print', {
        content: content.view.print
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
        return res.render('print', {
            content: content.view.print
        });
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

    Promise.all(dataFunctionsToCall.map(dataFunction => dataFunction(prisonNumber))).then(data => {
        createPdf(res, printItems, data);
    }).catch(err => console.log(err));
};

function createPdf(res, printItems, data) {
    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=test.pdf'
    });

    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
            Title: 'Historic Prisoner Application'
        }
    });
    const {forename, forename2, surname} = data[0];

    doc.fontSize(24);
    doc.text(`${forename}${forename2}${surname}`);
    doc.fontSize(12);

    printItems.forEach((item, index) => addSection(doc, availablePrintOptions[item], data[index]));

    doc.pipe(res);
    doc.end();
}

function addSection(doc, printOption, items) {
    const {title, addContent} = printOption;

    doc.moveDown(2);
    doc.fontSize(20).text(title);
    doc.fontSize(12);

   addContent(doc, items);
}

function summaryContent(doc, items) {

    const excludedItems = ['forename', 'forename2', 'surname'];

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'key', width: 150},
        {id: 'value', width: 300},
    ]);

    const tableBody = Object.keys(items).map(key => {
        if (items[key] && !excludedItems.includes(key)) {
            return {key: `${availablePrintOptions.summary.textMap[key] || key}: `, value: items[key]};
        }
    }).filter(n => n);

    table.addBody(tableBody);
}

function movementContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
            {id: 'date', width: 130},
            {id: 'establishment', width: 130},
            {id: 'detail', width: 300}
    ]);

    const tableBody = items.map(item => {
        const {date, establishment, type, status} = item;
        return {date, establishment, detail: `${type === 'D' ? 'OUT' : 'IN'} - ${status}`};
    });

    table.addBody(tableBody);
}

function hdcContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'stage', width: 140},
        {id: 'detail', width: 200},
        {id: 'reason', width: 200}
    ]);

    const tableBody = items.map(item => {
        const {stage, date, status, reason} = item;
        return {stage, detail: `${status}, ${date}`, reason};
    });

    table.addBody(tableBody);
}

function offenceContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'caseDate', width: 130},
        {id: 'offenceCode', width: 150},
        {id: 'establishment', width: 200}
    ]);

    const tableBody = items.map(item => {
        const {caseDate, offenceCode, establishment_code, establishment} = item;
        return {
            caseDate,
            offenceCode: `Offence code ${offenceCode}`,
            establishment: `(${establishment_code}) ${establishment}`};
    });

    table.addBody(tableBody);
}

function custodyOffenceContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'date', width: 130},
        {id: 'outcome', width: 250},
        {id: 'establishment', width: 150}
    ]);

    const tableBody = items.map((item) => {
        const {date, outcome, establishment} = item;
        return {date, outcome, establishment};
    });

    table.addBody(tableBody);
}

function addressContent(doc, items) {

    items.forEach(item => {
        doc.moveDown();
        const {type, name, addressLine1, addressLine2, addressLine3, addressLine4} = item;
        if(addressLine1) {
            if(type) doc.text(type);
            if(name) doc.text(name);
            if(addressLine1) doc.text(addressLine1);
            if(addressLine2) doc.text(addressLine2);
            if(addressLine3) doc.text(addressLine3);
            if(addressLine4) doc.text(addressLine4);
        }
    });
}
