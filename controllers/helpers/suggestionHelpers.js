module.exports = {
    getSearchSuggestions,
    getSearchTermsFromInput,
    useInitial,
    addWildcard,
    addShorterWildcard,
    useFirst,
    useLast,
    ageToAgeRange,
    dobToAgeRange
};

const Case = require('case');
const moment = require('moment');

function getSearchSuggestions(userInput) {

    const searchTerms = getSearchTermsFromInput(userInput);

    let suggestions = Object.keys(searchTerms)
        .filter(searchItem => searchSuggestions[searchItem])
        .reduce(suggestionsFor(searchTerms), {});

    return Object.keys(suggestions).length > 0 ? suggestions : null;
}


function getSearchTermsFromInput(userInput) {
    let inputs = Object.assign({}, userInput);

    if (inputs['dobOrAge'] === 'dob') {
        inputs['dob'] = [userInput['dobYear'], userInput['dobMonth'], userInput['dobDay']].join('-');
    }

    if (inputs['forename'] && inputs['surname']) {
        inputs['firstLast'] = {
            first: inputs['forename'],
            last: inputs['surname']
        };
    }

    return inputs;
}

const suggestionsFor = inputs => (allSuggestions, searchTerm) => {

    let suggestions = searchSuggestions[searchTerm].map(suggestion => {
        return Object.assign({}, suggestion, {value: suggestion.suggest(inputs[searchTerm])});
    }).map(suggestion => {
        delete suggestion['suggest'];
        return suggestion;
    }).filter(suggestion => suggestion.value !== null);

    return suggestions.length === 0 ? allSuggestions : Object.assign({}, allSuggestions, {[searchTerm]: suggestions});
};

const searchSuggestions = {
    forename: [{
        type: 'useInitial',
        term: 'forename',
        suggest: useInitial
    }],
    surname: [{
        type: 'addWildcard',
        term: 'surname',
        suggest: addWildcard
    }, {
        type: 'addShorterWildcard',
        term: 'surname',
        suggest: addShorterWildcard
    }],
    firstLast: [{
        type: 'swap',
        term: 'forename',
        suggest: useLast
    }, {
        type: 'swap',
        term: 'surname',
        suggest: useFirst
    }],
    age: [{
        type: 'widenAgeRange',
        term: 'age',
        suggest: ageToAgeRange
    }],
    dob: [{
        type: 'convertToAgeRange',
        term: 'age',
        suggest: dobToAgeRange
    }, {
        type: 'convertToAgeRange',
        term: 'dobOrAge',
        suggest: val => 'age'
    }]
};

function useInitial(name) {
    return name.length <= 1 ? null : Case.capital(name.substring(0, 1));
}

function addWildcard(name) {
    return name.endsWith('%') ? null : Case.capital(name.concat('%'));
}

function addShorterWildcard(name) {
    return name.length <= 2 || name.endsWith('%') ? null : Case.capital(name.substring(0, name.length - 2).concat('%'));
}

function useFirst(names) {
    return Case.capital(names.first);
}

function useLast(names) {
    return Case.capital(names.last);
}

function ageToAgeRange(age) {
    if (age.includes('-')) return null;
    let start = age - 2;
    let end = +age + 2;
    return `${start}-${end}`;
}

function dobToAgeRange(dob) {
    let years = moment().diff(dob, 'years');
    let start = years - 2;
    let end = +years + 2;
    return `${start}-${end}`;
}