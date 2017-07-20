const Case = require('case');

module.exports = {
    sentence,
    capital,
    sentenceWithAcronyms,
    capitalWithAcronyms
};

const rawAcronyms = [
    'ARD',
    'ARP',
    'CRC',
    'CJA',
    'DTO',
    'EPP',
    'GOAD',
    'HDC',
    'HDCED',
    'HMP',
    'HMYOI',
    'IPP',
    'NFA',
    'NPS',
    'OMU',
    'PO',
    'PS',
    'SPO',
    'YMCA',
    'YO',
    'YOI',
    'YP'
];

const acronyms = rawAcronyms.map(ac => {
    const pattern = '\\b(' + ac + ')\\b';
    return {
        raw: ac,
        regEx: new RegExp(pattern, 'gi')
    };
});

function sentence(text) {
    return Case.sentence(text);
}

function capital(text) {
    return Case.capital(text);
}

function sentenceWithAcronyms(text) {
    const sentenceText = Case.sentence(text);
    return acronymsToUpperCase(sentenceText);
}

function capitalWithAcronyms(text) {
    const sentenceText = Case.capital(text);
    return acronymsToUpperCase(sentenceText);
}

function acronymsToUpperCase(text) {
    return acronyms.reduce((returnText, acronym) => {
        return returnText.replace(acronym.regEx, Case.upper(acronym.raw));
    }, text);
}
