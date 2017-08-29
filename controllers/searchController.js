const config = require('../server/config');

const content = require('../data/content');
const logger = require('../log');
const {getSearchResultsCount, getSearchResults} = require('../data/search');
const utils = require('../data/utils');
const audit = require('../data/audit');
const resultsPerPage = require('../server/config').searchResultsPerPage;
const {validateDescriptionForm} = require('./helpers/formValidators');
const {searchNomis} = require('../data/nomisSearch');
const Case = require('case');


const {
    getInputtedFilters,
    removeAllFilters
} = require('./helpers/filterHelpers');
const {
    getQueryStringsForSearch,
    mergeIntoQuery,
    toggleFromQueryItem,
    getUrlAsObject,
    createUrl,
    retainUrlQuery
} = require('./helpers/urlHelpers');
const {
    getSearchSuggestions
} = require('./helpers/suggestionHelpers');


const availableSearchOptions = exports.availableSearchOptions = {
    identifier: {
        fields: ['prisonNumber', 'pncNumber', 'croNumber'],
        hints: []
    },
    names: {
        fields: ['forename', 'forename2', 'surname'],
        hints: ['wildcard']
    },
    dob: {
        fields: ['dobDay', 'dobMonth', 'dobYear', 'age'],
        hints: []
    }
};

const allAcceptableFields = Object.keys(availableSearchOptions).reduce((acceptableFields, searchOptionKey) => {
    return acceptableFields.concat(...availableSearchOptions[searchOptionKey].fields);
}, []);

function isIdentifierSearch(userInput) {
    const intersection = [...Object.keys(userInput)].filter(input => {
        return availableSearchOptions.identifier.fields.includes(input);
    });
    return intersection.length > 0;
}

exports.getIndex = function(req, res) {
    logger.debug('GET /search');

    const error = req.query.error ? getErrorData(req.query.error) : null;
    req.session.userInput = {};
    return res.render('search/index', parseResultsPageData(req, 0, null, null, error));
};

exports.postSearchForm = function(req, res) {
    const userInput = userInputFromSearchForm(req.body);
    const validationError = inputValidates(userInput);

    if (validationError) {
        logger.info('Server side input validation used');
        return res.render('search/index', parseResultsPageData(req, 0, null, null, validationError));
    }

    req.session.visited = [];
    req.session.userInput = userInput;
    res.redirect('/search/results');
};

exports.getResults = function(req, res) {
    logger.info('GET /search/results');
    if (!req.headers.referer) {
        return res.redirect('/search');
    }

    req.session.userInput = addFiltersToUserInput(req.session.userInput, req.query);

    // todo - this happens every time even if the userinput hasn't changed
    audit.record('SEARCH', req.user.email, req.session.userInput);

    getSearchResultsCount(req.session.userInput)
        .then(returnedRows => getSearchResultsAndRender(req, res)(returnedRows[0]))
        .catch(error => {
            logger.error('Error during number of rows search: ' + error.message);
            const query = {error: error.code};
            return res.redirect(createUrl('/search', query));
        });
};

function getSearchResultsAndRender(req, res) {

    const currentPage = getCurrentPage(req.query);
    req.session.userInput.page = currentPage;

    return function(rowCountData) {
        const rowCount = rowCountData.totalRows.value;
        if (rowCount === 0) {
            return res.render('search/index', parseResultsPageData(req, rowCount));
        }

        if (!isValidPage(currentPage, rowCount)) {
            return res.redirect(getReferrerUrlWithInvalidPage(req, currentPage));
        }

        return getSearchResults(req.session.userInput).then(searchResult => {
            const results = !searchResult || Array.isArray(searchResult) ? searchResult : [searchResult];
            return res.render('search/index', parseResultsPageData(req, rowCount, results, currentPage));
        }).catch(error => {
            logger.error('Error during inmate search: ' + error.message);
            const query = {error: error.code};
            return res.redirect(createUrl('/search', query));
        })
    };
}

function parseResultsPageData(req, rowCount, searchResults, page, error) {
    const searchedFor = getUserInput(req.session.userInput);
    const shortList = getShortList(req);
    const data = createDataObjects(searchResults, req.session, shortList);

    return {
        content: {
            title: 'HPA Prisoner Search'
        },
        rowCount,
        pagination: (rowCount > resultsPerPage ) ? utils.pagination(rowCount, page) : null,
        data,
        err: error || getPaginationErrors(req.query),
        filtersForView: getInputtedFilters(req.query, 'VIEW'),
        queryStrings: getQueryStringsForSearch(req.url),
        formContents: searchedFor,
        usePlaceholder: Object.keys(searchedFor).length === 0,
        idSearch: availableSearchOptions.identifier.fields.includes(Object.keys(searchedFor)[0]),
        suggestions: getSearchSuggestions(req.session.userInput),
        shortList,
        moment: require('moment'),
        setCase: require('case')
    };
}

exports.getSuggestions = function(req, res) {
    return res.render('search/suggestions', {
        content: content.view.suggestions,
        returnQuery: retainUrlQuery(req.url),
        suggestions: getSearchSuggestions(req.session.userInput)
    });
};

exports.getSuggestion = function(req, res) {
    req.session.userInput = applySuggestionsToUserInput(req.session.userInput, req.query, req.session);
    res.redirect('/search/results');
};

exports.getNomis = function(req, res) {
    return res.render('search/nomis', emptyNomisPage);
};

exports.getNomisResults = function(req, res) {
    logger.info('GET /search/nomis/results');

    if (!req.headers.referer) {
        return res.redirect('/search/nomis', emptyNomisPage);
    }

    // todo - this happens every time even if the userinput hasn't changed
    // audit.record('SEARCH_NOMIS', req.user.email, req.session.userInput);

    searchNomis(req.session.userInput).then(nomisData => {
        return res.render('search/nomis', parseNomisData(req, nomisData));
    }).catch(error => {
        logger.error('Error during nomis search: ' + error.message);
        const query = {error: error.code};
        return res.redirect(createUrl('/search', query));
    });
};

emptyNomisPage = {
    content: {
        title: 'NOMIS Prisoner Search'
    },
    usePlaceholder: true
};

function parseNomisData(req, nomisData) {
    const searchedFor = getUserInput(req.session.userInput);
    const searchTerms = getSearchTermsForView(req.session.userInput);
    const shortList = getShortList(req);
    const data = createDataObjects(searchResults, req.session, shortList);

    return {
        content: {
            title: 'NOMIS Prisoner Search'
        },
        rowCount: nomisData.length,
        data: nomisData,
        queryStrings: getQueryStringsForSearch(req.url),
        formContents: searchedFor,
        searchTerms: searchTerms,
        usePlaceholder: Object.keys(searchedFor).length === 0,
        idSearch: availableSearchOptions.identifier.fields.includes(Object.keys(searchedFor)[0]),
        shortList,
        moment: require('moment'),
        setCase: require('case')
    };
}

function createDataObjects(searchResults, session, shortList) {

    if(!searchResults) {
        return [];
    }

    return searchResults.map(inmate => {
        inmate.visited = session.visited ? session.visited.includes(inmate.prisonNumber) : false;
        inmate.shortListed = shortList ? shortList.prisonNumbers.includes(inmate.prisonNumber) : false;
        return inmate;
    });
}

function getUserInput(userInput) {
    return Object.keys(userInput).reduce((contents, field) => {
        if (allAcceptableFields.includes(field)) {
            return Object.assign({}, contents, {[field]: userInput[field]});
        }
        return contents;
    }, {});
}


function getShortList(req) {

    if(!req.query.shortList) {
        return null;
    }

    const shortList = Array.isArray(req.query.shortList) ? req.query.shortList : [req.query.shortList];

    return {
        prisonNumbers: shortList,
        href: `/comparison/${shortList.join(',')}`,
        latestName: req.query.shortListName || null
    };
}

function getErrorData(errorCode) {
    return {
        title: getMessageToDisplayFor(errorCode),
        desc: content.errMsg.COMMS_ERROR_DESC
    };
}

function getMessageToDisplayFor(errorCode) {

    let message = content.errorCodeMessages[errorCode];
    if (message) return message;

    logger.error('content.errorCodeMessages has no message for', {error: errorCode});
    return content.errMsg.COMMS_ERROR;
}

const userInputFromSearchForm = requestBody => {
    const getReturnedFields = composeFieldsForOptionReducer(requestBody);
    return Object.keys(availableSearchOptions).reduce(getReturnedFields, {});
};

const composeFieldsForOptionReducer = requestBody => (collatedData, option) => {
    const returnedFields = availableSearchOptions[option].fields.filter(field => requestBody[field]);

    returnedFields.forEach(field => collatedData[field] = requestBody[field].trim());
    return collatedData;
};

const inputValidates = userInput => {

    if (!Object.keys(userInput).length > 0) {
        return {
            title: 'Please enter a value for at least one field'
        };
    }

    return isIdentifierSearch(userInput) ? null : validateDescriptionForm(userInput);
};

exports.postPagination = function(req, res) {
    const query = mergeIntoQuery(req.query, {page: req.body.pageNumber});

    res.redirect(createUrl('/search/results', query));
};

exports.postFilters = function(req, res) {
    const acceptableFilters = ['Male', 'Female', 'HDC', 'Lifer'];
    const [filterPressed] = acceptableFilters.filter(filter => filter === req.body.filter);

    const newQueryObject = toggleFromQueryItem(req, 'filters', filterPressed, 'referrer');

    newQueryObject.page = '1';

    res.redirect(createUrl('/search/results', newQueryObject));
};

exports.postAddToShortlist = function(req, res) {
    const prisonNumberAdded = req.body.addToShortList;
    const nameAdded = req.body.addToShortListName;

    const newQueryObject = toggleFromQueryItem(req, 'shortList', prisonNumberAdded, 'referrer');
    const objWithName = nameAdded ? Object.assign({}, newQueryObject, {shortListName: nameAdded}) : newQueryObject;

    res.redirect(createUrl('/search/results', objWithName));
};

const getPaginationErrors = query => {
    if (query.invalidPage) {
        return {
            title: 'Invalid selection',
            desc: `The page number ${query.invalidPage} does not exist`
        };
    }
    return null;
};

function getReferrerUrlWithInvalidPage(req, attemptedPage) {
    const urlObj = getUrlAsObject(req.get('referrer'));
    urlObj.query.invalidPage = attemptedPage;

    return createUrl(urlObj.pathname, urlObj.query);
}

const isNumeric = value => /^\d+$/.test(value);

function isValidPage(page, rowCount) {
    return isNumeric(page) && page > 0 && !(rowCount > 0 && page > Math.ceil(rowCount / resultsPerPage));
}

function getCurrentPage(query) {
    const page = query ? Number(query.page) : 1;
    return Number.isNaN(page) ? 1 : page;
}

function addFiltersToUserInput(userInput, query) {
    const filtersForQuery = getInputtedFilters(query, 'QUERY');
    const cleanInput = removeAllFilters(userInput);

    if (!filtersForQuery) {
        return Object.assign({}, cleanInput);
    }
    return Object.assign({}, cleanInput, filtersForQuery);
}

function applySuggestionsToUserInput(userInput, query, session) {

    if (!query.suggest || !query.field) return userInput;

    const suggestions = getSearchSuggestions(session.userInput);

    const suggestionsToApply = suggestions[query.field].filter(suggestion =>
        suggestion.type === query.suggest
    );

    if (!suggestionsToApply || suggestionsToApply.length === 0) return userInput;

    return Object.assign({}, userInput, suggestionsToApply.reduce(newValues, {}));
}

function newValues(newValues, suggestion) {
    return Object.assign({}, newValues, {[suggestion.term]: suggestion.value});
}


function getSearchTermsForView(userInput) {

    const searchTerms = (userInput['dobYear']) ? searchTermObjectWithDob(userInput) : {};

    return Object.keys(userInput).filter(searchItem => content.termDisplayNames[searchItem])
        .reduce(searchTermInCorrectCase(userInput), searchTerms);
}

const searchTermObjectWithDob = userInput => {
    const value = [userInput['dobDay'], userInput['dobMonth'], userInput['dobYear']].join('/');
    const itemName = content.termDisplayNames['dob'].name;

    return searchTermObject(itemName, false, value);
};

const searchTermInCorrectCase = userInput => (allTerms, searchTerm) => {

    const itemName = content.termDisplayNames[searchTerm].name;
    const capitaliseName = content.termDisplayNames[searchTerm].textFormat === 'capitalise';
    const termObject = searchTermObject(itemName, capitaliseName, userInput[searchTerm]);

    return Object.assign({}, allTerms, termObject);
};

const searchTermObject = (itemName, capitaliseValue, value) => {
    const valueWithCase = capitaliseValue ? Case.capital(value) : value;
    return {[itemName]: valueWithCase};
};
