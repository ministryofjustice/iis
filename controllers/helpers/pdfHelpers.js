const PDFDocument = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
const content = require('../../data/content');
const Case = require('./textHelpers');
const moment = require('moment');
const logger = require('../../log');

module.exports = {
    createPdf,
    addSection,
    subjectContent,
    sentenceSummaryContent,
    sentenceHistoryContent,
    courtHearingsContent,
    movementContent,
    hdcInfoContent,
    hdcRecallContent,
    offenceContent,
    custodyOffenceContent,
    addressContent,
    twoColumnTable,
    aliasContent
};

function createPdf(res, printItems, data, availablePrintOptions, options = {}) {

    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=hpa-download.pdf',
        Pragma: 'token'
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
        Object.keys(availablePrintOptions[item]).forEach(dataType => {
            addSection(doc, availablePrintOptions[item], data[dataType], dataType);
        });

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
        doc.image('assets/images/icon-important-2x.png', doc.x + 200, doc.y - 80, {width: 10});
        doc.fontSize(13);
        doc.text('Notice', doc.x + 220, doc.y - 80, {align: 'justify'});
        doc.fontSize(10);
        doc.text(content.pdf.disclaimer, doc.x - 20, doc.y, {align: 'justify'});
        doc.fontSize(11);
        doc.moveDown();
        doc.moveTo(doc.x - 200, doc.y).lineTo(545, doc.y).stroke('#ccc');
        doc.moveDown(2);
        doc.fontSize(24);
        doc.text(`${Case.capital(firstName)} ${Case.capital(lastName)}, ${prisonNumber}`, doc.x - 200, doc.y);
        doc.moveDown();
        doc.fontSize(12);
    });
}

function addSection(doc, printOption, items, dataType) {

    const {title, addContent} = printOption[dataType];

    doc.addPage();

    doc.fontSize(20).text(title);
    doc.fontSize(12);

    if (!items) return emptySection(doc, title);

    addContent(doc, items);
}

function emptySection(doc, title) {
    doc.moveDown();
    doc.text(`Subject has no ${Case.lower(title)}.`);
}

function subSection(doc, title) {
    doc.moveDown();
    doc.fontSize(14).text(title);
    doc.fontSize(12);
}

function pad(doc, text) {
    doc.moveDown();
    doc.text(text);
    doc.moveDown();
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
            const value = getSubjectValue(items, key);
            return {key: `${content.pdf.subject2[key] || key}: `, value};
        }
    }).filter(n => n);
    table.setNewPageFn(table => table.pdf.addPage());
    table.addBody(tableBody);
}

function getSubjectValue(items, key) {
    const dates = ['dob', 'receptionDate'];

    if (dates.includes(key)) {
        return moment(items[key]).format('DD/MM/YYYY');
    }

    if (key === 'sex') {
        if (items[key] === 'M') {
            return 'Male';
        }

        if (items[key] === 'F') {
            return 'Female';
        }
    }
    return items[key];
}

function sentenceSummaryContent(doc, items) {

    subSection(doc, 'Last recorded establishment');
    pad(doc, Case.capital(items.establishment));

    subSection(doc, 'Last recorded category');
    categoryContent(doc, [items.category]);

    subSection(doc, 'Court Hearing');
    courtHearingsContent(doc, [items.courtHearing]);

    subSection(doc, 'Effective Sentence');
    sentenceHistoryContent(doc, [items.effectiveSentence]);
}

function sentenceHistoryContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'changeDate', width: 130},
        {id: 'length', width: 150},
        {id: 'dates', width: 150, align: 'left'}
    ]);

    const tableBody = items.map(item => {
        const {changeDate, lengthDays} = item;
        const keyDateKeys = ['CRD', 'HDCED', 'LED', 'SED'];

        const dateString = Object.keys(item).map(key => {
            if (keyDateKeys.includes(key)) {
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

function categoryContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'date', width: 130},
        {id: 'category', width: 300}
    ]);

    const tableBody = items.map(item => {
        const {date, category} = item;
        return {date: moment(date).format('DD/MM/YYYY'), category: Case.capital(category)};
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
        return {
            date: moment(date).format('DD/MM/YYYY'),
            establishment: Case.capital(establishment),
            detail: `${type === 'D' ? 'OUT' : 'IN'} - ${Case.sentenceWithAcronyms(movement)}`
        };
    });
    table.setNewPageFn(table => table.pdf.addPage());
    table.addBody(tableBody);
}

function hdcInfoContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'stage', width: 130},
        {id: 'detail', width: 190},
        {id: 'reason', width: 180}
    ]);

    const tableBody = items.map(item => {
        const {stage, date, status, reasons} = item;
        return {
            stage: Case.sentenceWithAcronyms(stage),
            detail: `${Case.sentenceWithAcronyms(status)}, ${moment(date).format('DD/MM/YYYY')}`,
            reasons: Case.capitalWithAcronyms(reasons)
        };
    });
    table.setNewPageFn(table => table.pdf.addPage());
    table.addBody(tableBody);
}

function hdcRecallContent(doc, items) {

    items.forEach(item => {
        const table = new PDFTable(doc, {bottomMargin: 30});
        table.addColumns([
            {id: 'key', width: 170},
            {id: 'value', width: 300}
        ]);
        const {createdDate, curfewEndDate, outcome, outcomeDate, reason} = item;

        const tableBody = [
            {key: 'Recall date', value: moment(createdDate).format('DD/MM/YYYY')},
            {key: 'Original curfew end date', value: moment(curfewEndDate).format('DD/MM/YYYY')},
            {key: 'Outcome', value: Case.sentenceWithAcronyms(outcome)},
            {key: 'Outcome date', value: moment(outcomeDate).format('DD/MM/YYYY')},
            {key: 'Reason', value: Case.sentenceWithAcronyms(reason)}
        ];

        table.setNewPageFn(table => table.pdf.addPage());
        table.addBody(tableBody);

        doc.moveDown();
    });
}

function offenceContent(doc, items) {

    const table = new PDFTable(doc, {bottomMargin: 30});
    table.addColumns([
        {id: 'date', width: 130},
        {id: 'offenceCode', width: 200},
        {id: 'establishment', width: 200}
    ]);

    const tableBody = items.map(item => {
        const {date, code, establishment, establishment_code} = item;
        return {
            date: moment(date).format('DD/MM/YYYY'),
            offenceCode: `Offence code ${code}`,
            establishment: establishment ? `${Case.sentenceWithAcronyms(establishment)}` : `${establishment_code}`
        };
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
        return {
            date: moment(date).format('DD/MM/YYYY'),
            detail: `${Case.sentence(outcome)} - ${Case.sentenceWithAcronyms(charge)}`,
            establishment: Case.sentenceWithAcronyms(establishment)
        };
    });
    table.setNewPageFn(table => table.pdf.addPage());
    table.addBody(tableBody);
}

function addressContent(doc, items) {

    items.forEach(item => {
        doc.moveDown();
        const {type, person, street, town, county} = item;
        if (street) {
            if (type) Case.capital(doc.text(type));
            if (person) doc.text(Case.capital(person));
            if (street) doc.text(Case.capitalWithAcronyms(street));
            if (town) doc.text(Case.capital(town));
            if (county) doc.text(Case.capital(county));
        }
    });
}

function aliasContent(doc, items) {

    items.forEach(item => {
        doc.moveDown();
        const {first, middle, last, birthDate} = item;

        if (first || middle || last) {
            doc.text(Case.capital(first + ' ' + middle + ' ' + last));
        }
        if (birthDate) {
            doc.text(`Born on: ${moment(birthDate).format('DD/MM/YYYY')}`);
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
