const moment = require('moment');


// Anything else is ignored / not used in the query
const translations = {
    forename: forenameTerm,
    forename2: forename2Term,
    surname: surnameTerm,
    dobYear: dobTerm,
    age: ageTerm,
    pncNumber: unchangedTerm,
    croNumber: unchangedTerm
};

exports.translateQuery = function(userInput) {
    return Object.keys(userInput).reduce(convert(userInput), {});
};

const convert = searchTerms => (inputs, key) => {

    const value = searchTerms[key];
    if (!value || !translations[key]) {
        return inputs;
    }

    const translation = translations[key](key, searchTerms);
    if (!translation) {
        return inputs;
    }

    return Object.assign({}, inputs, translation);
};


function forenameTerm(key, searchTerms) {
    return {firstName: searchTerms[key]};
}

function forename2Term(key, searchTerms) {
    return {middleNames: searchTerms[key]};
}

function surnameTerm(key, searchTerms) {
    return {lastName: searchTerms[key]};
}

function unchangedTerm(key, searchTerms) {
    return {[key]: searchTerms[key]};
}

function dobTerm(key, searchTerms) {
    const dobDate = [searchTerms['dobYear'], searchTerms['dobMonth'], searchTerms['dobDay']].join('-');
    return {dob: dobDate};
}

function ageTerm(key, searchTerms) {
    const age = searchTerms[key];
    if (age.includes('-')) {
        return translateAgeRange(age);
    }
    return translateAge(age);
}

function translateAge(age) {
    return {dob: ageToDob(age)};
}

function translateAgeRange(age) {
    const ages = age.split('-');
    return {
        'dobFrom': ageToDob(ages[0]),
        'dobTo': ageToDob(ages[1])
    };
}

function ageToDob(age) {
    return new moment().subtract(age, 'years').format('YYYY-MM-DD');
}
