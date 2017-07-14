const PDFDocument = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
const content = require('../../data/content');
const Case = require('case');
const moment = require('moment');

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
    addressContent,
    twoColumnTable
};

function createPdf(res, printItems, data, availablePrintOptions, options = {}) {

    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=hpa-download.pdf',
        'Pragma': 'token'
    });

    const doc = new PDFDocument({
        autoFirstPage: false,
        size: 'A4',
        margin: 50,
        info: {
            Title: 'Historic Prisoner Application'
        }
    });

    if (options.type && options.type === 'searchPrint') {
        createSearchPrint(doc, data, options);
    } else {
        doc.fontSize(12);
        doc.moveDown(2);
    }

    printItems.forEach(item => {
        addSection(doc, availablePrintOptions[item], data[item]);
    });

    doc.pipe(res);
    doc.end();
}

function createSearchPrint(doc, data) {
    const {firstName, lastName} = data.summary;
    const {prisonNumber} = data.summary;

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
        doc.text(`${Case.capital(firstName)} ${Case.capital(lastName)}, ${prisonNumber}`, doc.x-200, doc.y);
        doc.moveDown();
        doc.fontSize(12);
    });
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

    const excludedItems = ['initial', 'firstName', 'middleName', 'lastName'];

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'key', width: 150},
        {id: 'value', width: 300}
    ]);

    const tableBody = Object.keys(items).map(key => {
        if (items[key] && !excludedItems.includes(key)) {
            const value = typeof items[key] === 'string' ? items[key].trim() : items[key];
            return {key: `${content.pdf.subject2[key] || key}: `, value};
        }
    }).filter(n => n);
    table.setNewPageFn(table => table.pdf.addPage());
    table.addBody(tableBody);
}

function sentenceHistoryContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'changeDate', width: 150},
        {id: 'length', width: 150},
        {id: 'dates', width: 150, align: 'left'}
    ]);

    const tableBody = items.map(item => {
        const {changeDate, lengthDays} = item;
        const keyDateKeys = ['CRD', 'HDCED', 'LED', 'SED'];

        const dateString = Object.keys(item).map(key => {
                if(keyDateKeys.includes(key)) {
                    return `${key}: ${moment(item[key]).format('DD/MM/YYYY')}`;
                }
            })
            .filter(n => n)
            .join('\n');

        return {changeDate: moment(changeDate).format('DD/MM/YYYY'), length: `${lengthDays} days`, dates: dateString};
    });
    table.setNewPageFn(table => table.pdf.addPage());
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
        return {date: moment(date).format('DD/MM/YYYY'), court: Case.capital(court)};
    });
    table.setNewPageFn(table => table.pdf.addPage());
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
        const {date, establishment, type, movement} = item;
        return {date: moment(date).format('DD/MM/YYYY'),
            establishment: Case.capital(establishment),
            detail: `${type === 'D' ? 'OUT' : 'IN'} - ${Case.capital(movement)}`};
    });
    table.setNewPageFn(table => table.pdf.addPage());
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
    table.setNewPageFn(table => table.pdf.addPage());
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
        const {caseDate, offenceCode, establishment, establishment_code} = item;
        return {
            caseDate,
            offenceCode: `Offence code ${offenceCode}`,
            establishment: establishment ? `${establishment}` : `${establishment_code}`};
    });
    table.setNewPageFn(table => table.pdf.addPage());
    table.addBody(tableBody);
}

function custodyOffenceContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'date', width: 100},
        {id: 'detail', width: 250},
        {id: 'establishment', width: 150}
    ]);

    const tableBody = items.map(item => {
        const {date, outcome, charge, establishment} = item;
        return {date, detail: `${outcome} - ${charge}` , establishment};
    });
    table.setNewPageFn(table => table.pdf.addPage());
    table.addBody(tableBody);
}

function addressContent(doc, items) {

    items.forEach(item => {
        doc.moveDown();
        const {type, name, addressLine1, addressLine2, addressLine4} = item;
        if(addressLine1) {
            if(type) doc.text(type);
            if(name) doc.text(name);
            if(addressLine1) doc.text(addressLine1);
            if(addressLine2) doc.text(addressLine2);
            if(addressLine4) doc.text(addressLine4);
        }
    });
}

function twoColumnTable(doc, items) {
    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'item0', width: 400},
        {id: 'item1', width: 200}
    ]);

    const tableBody = items.map(item => {
        return Object.keys(item).reduce((obj, itemKey, index) => {
            obj[`item${index}`] = item[itemKey];
            return obj;
        }, {});
    });

    table.setNewPageFn(table => table.pdf.addPage());
    table.addBody(tableBody);
}
