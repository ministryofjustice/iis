const content = require('../data/content');
const logger = require('../log');
const dob = require('../data/dob');
const identifier = require('../data/identifier');
const names = require('../data/names');
const {getSearchResultsCount, getSearchResults} = require('../data/search');
const utils = require('../data/utils');
const audit = require('../data/audit');
const resultsPerPage = require('../server/config').searchResultsPerPage;
const Case = require('case');
const url = require('url');
const moment = require('moment');

const {
    objectKeysInArray,
    itemsInQueryString
} = require('./helpers/formHelpers');
const {
    getInputtedFilters,
    removeAllFilters
} = require('./helpers/filterHelpers');
const {
    getQueryStringsForSearch,
    mergeIntoQuery,
    toggleFromQueryItem,
    getUrlAsObject,
    createUrl
} = require('./helpers/urlHelpers');
const {
    getSearchSuggestions
} = require('./helpers/suggestionHelpers');

const availableSearchOptions = exports.availableSearchOptions = {
    identifier: {
        fields: ['prisonNumber', 'pncNumber', 'croNumber'],
        validator: identifier.validate,
        hints: []
    },
    names: {
        fields: ['forename', 'forename2', 'surname'],
        validator: names.validate,
        hints: ['wildcard']
    },
    dob: {
        fields: ['dobOrAge', 'dobDay', 'dobMonth', 'dobYear', 'age'],
        validator: dob.validate,
        hints: []
    }
};

exports.getIndex = function(req, res) {
    logger.debug('GET /search');

    const error = req.query.error ? getDbErrorData(req.query.error) : null;

    return res.render('search', {
        content: content.view.search,
        err: error
    });
};

exports.postIndex = function(req, res) {

    logger.debug('POST /search');
    const userReturnedOptions = req.body.option;

    if (!userReturnedOptions || userReturnedOptions.length === 0) {

        logger.info('Search: No search option supplied', {userId: req.user.id});

        let _err = {
            title: content.errMsg.CANNOT_SUBMIT,
            desc: content.errMsg.NO_OPTION_SELECTED
        };

        res.render('search', {
            err: _err,
            content: content.view.search
        });
        return;
    }

    const selectedOptions = objectKeysInArray(availableSearchOptions, userReturnedOptions);

    return res.redirect(createUrl('/search/form', selectedOptions));
};

exports.getSearchForm = function(req, res) {
    const searchItems = itemsInQueryString(req.query);
    const anyUnsupportedItems = searchItems.some(item => !availableSearchOptions[item]);

    if (anyUnsupportedItems) {
        logger.warn('No such search option', {view: req.params.view});
        return res.redirect('/search');
    }

    const hints = flatten(searchItems.map(item => availableSearchOptions[item].hints));
    res.render('search/full-search', {
        content: content.view.search,
        searchItems,
        hints
    });
};

exports.postSearchForm = function(req, res) {

    const userInput = userInputFromSearchForm(req.body);
    const searchItems = itemsInQueryString(req.query).filter(item => availableSearchOptions[item]);

    if (!inputValidates(searchItems, userInput)) {
        logger.info('Server side input validation used');
        return res.redirect('/search');
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

    audit.record('SEARCH', req.user.email, req.session.userInput);

    getSearchResultsCount(req.session.userInput)
        .then(returnedRows => getSearchResultsAndRender(req, res)(returnedRows))
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
            return res.render('search/results', parseResultsPageData(req, rowCount));
        }

        if (!isValidPage(currentPage, rowCount)) {
            return res.redirect(getReferrerUrlWithInvalidPage(req, currentPage));
        }

        return getSearchResults(req.session.userInput).then(searchResult => {
            return res.render('search/results', parseResultsPageData(req, rowCount, searchResult, currentPage));
        }).catch(error => {
            logger.error('Error during inmate search: ' + error.message);
            const query = {error: error.code};
            return res.redirect(createUrl('/search', query));
        });
    };
}

exports.getEditSearch = function(req, res) {
    const formItemSelected = req.query.formItem;

    if (!formItemSelected || !Object.keys(availableSearchOptions).includes(formItemSelected) || !req.session.userInput) {
        return res.redirect('/search');
    }

    const formContents = availableSearchOptions[formItemSelected].fields.reduce((formObject, formItem) => {
        if (req.session.userInput[formItem]) {
            return Object.assign({}, formObject, {[formItem]: req.session.userInput[formItem]});
        }
        return formObject;
    }, {});

    res.render('search/full-search', {
        content: content.view.search,
        searchItems: formItemSelected,
        hints: availableSearchOptions[formItemSelected].hints,
        formContents
    });
};

exports.postEditSearch = function(req, res) {
    const oldUserInput = Object.assign({}, req.session.userInput);
    const newUserInput = userInputFromSearchForm(req.body);
    const removeIfCurrentCriteria = removeAllFromSameCriteriaConstructor(oldUserInput, newUserInput);
    const oldInputWithoutCurrentCriteria = Object.keys(oldUserInput).reduce(removeIfCurrentCriteria, {});

    const searchItems = itemsInQueryString(req.query).filter(item => availableSearchOptions[item]);
    if (!inputValidates(searchItems, newUserInput)) {
        logger.info('Server side input validation used');
        return res.redirect('/search');
    }

    req.session.userInput = Object.assign({}, oldInputWithoutCurrentCriteria, newUserInput);
    res.redirect('/search/results');
};

exports.getSuggestions = function(req, res) {
    return res.render('search/suggestions', {
        content: content.view.suggestions,
        returnQuery: url.parse(req.url).search ? url.parse(req.url).search : '',
        suggestions: getSearchSuggestions(req.session.userInput),
        searchTerms: req.session.searchTerms
    });
};

exports.getSuggestion = function(req, res) {
    req.session.userInput = applySuggestionsToUserInput(req.session.userInput, req.query, req.session);
    res.redirect('/search/results');
};


function parseResultsPageData(req, rowcount, data, page) {

    req.session.searchTerms = getSearchTermsForView(req.session.userInput);

    return {
        content: {
            title: getPageTitle(rowcount)
        },
        pagination: (rowcount > resultsPerPage ) ? utils.pagination(rowcount, page) : null,
        data: addSelectionVisitedData(data, req.session) || [],
        err: getPaginationErrors(req.query),
        filtersForView: getInputtedFilters(req.query, 'VIEW'),
        queryStrings: getQueryStringsForSearch(req.url),
        suggestions: getSearchSuggestions(req.session.userInput),
        searchTerms: req.session.searchTerms,
        moment: require('moment'),
        setCase: require('case')
    };
}

function getDbErrorData(errorCode) {
    return {
        title: getMessageToDisplayFor(errorCode),
        desc: content.errMsg.DB_ERROR_DESC
    };
}

function getMessageToDisplayFor(errorCode) {

    let message = content.dbErrorCodeMessages[errorCode];
    if (message) return message;

    logger.error('content.dbErrorCodeMessages has no message for', {error: errorCode});
    return content.errMsg.DB_ERROR;
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

const inputValidates = (searchItems, userInput) => {
    return !searchItems.some(item => availableSearchOptions[item].validator(userInput, err => err));
};

const flatten = arr => Array.prototype.concat(...arr);

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

function getPageTitle(rowcount) {

    let oResultsPageContent = content.view.results;

    if (rowcount === 0) {
        return [oResultsPageContent.title_no_results];
    }

    let title = oResultsPageContent.title.split(' _x_ ');
    title[1] = `${rowcount} ${title[1]}`;

    if (rowcount > 1) {
        title[1] += 's';
    }

    return title;
}

function addSelectionVisitedData(data, session) {
    if (!data || !session.visited || session.visited.length === 0) {
        return data;
    }

    return data.map(inmate => {
        inmate.visited = session.visited.includes(inmate.prisonNumber);
        return inmate;
    });
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

    const searchTerms = (userInput['dobOrAge'] === 'dob') ? searchTermObjectWithDob(userInput) : {};

    return Object.keys(userInput).filter(searchItem => content.termDisplayNames[searchItem])
        .reduce(searchTermInCorrectCase(userInput), searchTerms);
}

const searchTermObjectWithDob = userInput => {
    const value = [userInput['dobDay'], userInput['dobMonth'], userInput['dobYear']].join('/');
    const itemName = content.termDisplayNames['dob'].name;

    return searchTermObject('dob', itemName, false, value);
};

const searchTermInCorrectCase = userInput => (allTerms, searchTerm) => {

    const searchCriteria = searchCriteriaForInputType(searchTerm);
    const itemName = content.termDisplayNames[searchTerm].name;
    const capitaliseName = content.termDisplayNames[searchTerm].textFormat === 'capitalise';
    const termObject = searchTermObject(searchCriteria, itemName, capitaliseName, userInput[searchTerm]);

    return Object.assign({}, allTerms, termObject);
};

const searchCriteriaForInputType = term => {
    return Object.keys(availableSearchOptions).find(criteria => availableSearchOptions[criteria].fields.includes(term));
};

const searchTermObject = (searchCriteria, itemName, capitaliseValue, value) => {
    const valueWithCase = capitaliseValue ? Case.capital(value) : value;
    return {[itemName]: {searchCriteria, value: valueWithCase}};
};

const removeAllFromSameCriteriaConstructor = (existingUserInput, userInput) => (newObj, inputType) => {
    const searchCriteria = searchCriteriaForInputType(Object.keys(userInput)[0]);
    if (availableSearchOptions[searchCriteria].fields.includes(inputType)) {
        return newObj;
    }
    return Object.assign({}, newObj, {[inputType]: existingUserInput[inputType]});
}
