const PDFDocument = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
const content = require('../../data/content');
const Case = require('case');

module.exports = {
    createPdf,
    addSection,
    subjectContent,
    sentenceHistoryContent,
    courtHearingsContent,
    movementContent,
    hdcContent,
    offenceContent,
    custodyOffenceContent,
    addressContent
};

function createPdf(res, printItems, data, availablePrintOptions, name) {
    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=hpa-'+name.surname+'.pdf'
    });

    const doc = new PDFDocument({
        autoFirstPage: false,
        size: 'A4',
        margin: 50,
        info: {
            Title: 'Historic Prisoner Application'
        }
    });

    const {forename, surname, prisonNumber} = name;

    doc.on('pageAdded', () => {
        doc.moveTo(doc.x, doc.y).lineTo(545, doc.y).stroke('#ccc');
        doc.moveDown(2);
        doc.image('assets/images/HMPPS_logo_crop.png', {width: 160});
        doc.image('assets/images/icon-important-2x.png', doc.x+200, doc.y-80, {width: 10});
        doc.fontSize(13);
        doc.text('Notice', doc.x+220, doc.y-80, {align: 'justify'});
        doc.fontSize(10);
        doc.text(content.pdf.disclaimer, doc.x-20, doc.y, {align: 'justify'});
        doc.fontSize(11);
        doc.moveDown();
        doc.moveTo(doc.x-200, doc.y).lineTo(545, doc.y).stroke('#ccc');
        doc.moveDown(2);
        doc.fontSize(24);
        doc.text(`${Case.capital(forename)} ${Case.capital(surname)}, ${prisonNumber}`, doc.x-200, doc.y);
        doc.moveDown();
    });

    printItems.forEach((item, index) => addSection(doc, availablePrintOptions[item], data[index]));

    doc.pipe(res);
    doc.end();
}


function addSection(doc, printOption, items) {
    const {title, addContent} = printOption;

    doc.addPage();

    doc.fontSize(20).text(title);
    doc.fontSize(12);

    if (items.length === 0) return emptySection(doc, title);

    addContent(doc, items);
}

function emptySection(doc, title) {
    doc.moveDown();
    doc.text(`Subject has no ${Case.lower(title)}.`);
}

function subjectContent(doc, items) {

    const excludedItems = ['forename', 'forename2', 'surname'];

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'key', width: 150},
        {id: 'value', width: 300}
    ]);

    const tableBody = Object.keys(items).map(key => {
        if (items[key] && !excludedItems.includes(key)) {
            return {key: `${content.pdf.subject[key] || key}: `, value: items[key]};
        }
    }).filter(n => n);

    table.addBody(tableBody);
}

function sentenceHistoryContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'changeDate', width: 100},
        {id: 'length', width: 100},
        {id: 'reasonCode', width: 100},
        {id: 'dates', width: 130, align: 'right'}
    ]);

    const tableBody = items.map(item => {
        const {changeDate, length, reasonCode, keyDates} = item;

        const dateString = Object.keys(keyDates).map(key => {
            return `${key} ${keyDates[key]}`;
        }).join('\n');

        return {changeDate, length: `${length} days`, reasonCode, dates: dateString};
    });

    table.addBody(tableBody);
}

function courtHearingsContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'date', width: 130},
        {id: 'court', width: 300}
    ]);

    const tableBody = items.map(item => {
        const {date, court} = item;
        return {date, court};
    });

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
        {id: 'stage', width: 130},
        {id: 'detail', width: 190},
        {id: 'reason', width: 180}
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
        {id: 'offenceCode', width: 200},
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
        {id: 'outcome', width: 200},
        {id: 'establishment', width: 200}
    ]);

    const tableBody = items.map(item => {
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
