const PDFDocument = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
const content = require('../data/content');
const logger = require('../log');
const url = require('url');
const {
    objectKeysInArray,
    itemsInQueryString
} = require('./helpers/formHelpers');

const availablePrintOptions = {
    summary: {
        title: 'Summary',
        items: ['White British', 'Male', 'Single', 'Born in England', 'National of United Kingdom'],
        addContent: summaryContent
    },
    movements: {
        title: 'Movements',
        items: [
            {date: '12/02/1988', establishment: 'Frankland', direction: 'OUT', detail: 'Discharged to court'},
            {date: '21/12/1987', establishment: 'Durham', direction: 'IN', detail: 'Unconvicted remand'},
            {date: '21/12/1987', establishment: 'Belmarsh', direction: 'OUT', detail: 'Discharged to court'},
            {date: '28/09/1987', establishment: 'Belmarsh', direction: 'IN', detail: 'Unconvicted remand'}
        ],
        addContent: movementContent
    },
    hdc: {
        title: 'HDC history',
        items: [
            {stage: 'HDC eligibility result', date: '18/03/2013', status: 'Eligible', reason: 'Created manually'},
            {stage: 'HDC eligibility', date: '18/03/2013', status: 'Manual check pass', reason: 'Pass all eligibility checks'},
            {stage: 'HDC eligibility', date: '27/06/2012', status: 'Auto check pass', reason: 'Manual check - prev. Custody'},
            {stage: 'HDC eligibility', date: '27/06/2012', status: 'Auto check pass', reason: 'Change in sentence history'}
        ],
        addContent: hdcContent
    },
    offences: {
        title: 'Offences',
        items: [
            {date: '01/01/2001', offenceCode: '101', establishmentCode: 'BAZZ', establishment: 'Belmarsh'},
            {date: '02/01/2001', offenceCode: '48', establishmentCode: 'DMZZ', establishment: 'Durham'},
            {date: '03/01/2001', offenceCode: '49', establishmentCode: 'FKZZ', establishment: 'Frankland'}
        ],
        addContent: offenceContent
    },
    custodyOffences: {
        title: 'Offences in custody',
        items: [
            {date: '01/01/2001', outcome: 'Proved - Disobeying a lawful order', establishment: 'Belmarsh'},
            {date: '02/01/2001', outcome: 'Not proven - Offence against GOAD', establishment: 'Durham'},
            {date: '03/01/2001', outcome: 'Not proceeded with - Fighting', establishment: 'Frankland'},
            {date: '04/01/2001', outcome: 'Dismissed - Assault on inmate', establishment: 'Full Sutton'}
        ],
        addContent: custodyOffenceContent
    },
    addresses: {
        title: 'Addresses',
        items: [
            {type: 'Other', name: 'First Lasta', addressLine1: '1, Street Road', addressLine2: 'Town a', addressLine3: 'Merseyside'},
            {type: 'Next of Kin', name: 'First Lastc', addressLine1: '3, Street Road', addressLine2: 'Town C', addressLine3: 'Merseyside'}
        ],
        addContent: addressContent
    }
};


exports.getPrintForm = (req, res) => {
    logger.debug('GET /print');

    return res.render('print', {
        content: content.view.print
    });
};

exports.postPrintForm = (req, res) => {
    logger.debug('POST /print');
    const userReturnedOptions = req.body.printOption;

    const selectedOptions = objectKeysInArray(availablePrintOptions, userReturnedOptions);

    if (selectedOptions.length === 0) {
        logger.warn('No print items selected');
        return res.render('print', {
            content: content.view.print
        });
    }

    const redirectUrl = url.format({'pathname': '/print/pdf', 'query': selectedOptions});
    return res.redirect(redirectUrl);
};

exports.getPdf = function(req, res) {

    const printItems = itemsInQueryString(req.query).filter((item) => availablePrintOptions[item]);

    if (printItems.length === 0) {
        logger.warn('No print items selected');
        return res.render('print', {
            content: content.view.print
        });
    }

    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=test.pdf'
    } );

   const doc = new PDFDocument({
       size: 'A4',
       margin: 50,
       info: {
           Title: 'Historic Prisoner Application'
       }
   });
   doc.fontSize(24);
   doc.text('Matthew Whitfield');
   doc.fontSize(12);
   doc.text('Prison No. EF993939');
   doc.text('Parole reference X99390');
   doc.text('NIB AB8894944');
   doc.text('PNC X9933009');

   printItems.forEach((item) => addSection(doc, availablePrintOptions[item]));

   doc.pipe(res);
   doc.end();
};

function addSection(doc, printOption) {
    const {title, items, addContent} = printOption;

    doc.moveDown(2);
    doc.fontSize(20).text(title);
    doc.fontSize(12);

    addContent(doc, items);
}

function summaryContent(doc, items) {
    items.forEach((item) => doc.text(item));
}

function movementContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
            {id: 'date', width: 130},
            {id: 'establishment', width: 130},
            {id: 'detail', width: 300}
    ]);

    const tableBody = items.map((item) => {
        const {date, establishment, direction, detail} = item;
        return {date, establishment, detail: `${direction} - ${detail}`};
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

    const tableBody = items.map((item) => {
        const {stage, date, status, reason} = item;
        return {stage, detail: `${status}, ${date}`, reason};
    });

    table.addBody(tableBody);
}

function offenceContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'date', width: 130},
        {id: 'offenceCode', width: 150},
        {id: 'establishment', width: 200}
    ]);

    const tableBody = items.map((item) => {
        const {date, offenceCode, establishmentCode, establishment} = item;
        return {
            date,
            offenceCode: `Offence code ${offenceCode}`,
            establishment: `(${establishmentCode}) ${establishment}`};
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

    items.forEach((item) => {
        doc.moveDown();
        const {type, name, addressLine1, addressLine2, addressLine3} = item;
        doc.text(type);
        doc.text(name);
        doc.text(addressLine1);
        doc.text(addressLine2);
        doc.text(addressLine3);
    });
}
