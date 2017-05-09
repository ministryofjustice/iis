const content = require('../data/content');
const logger = require('../log');
const url = require('url');
const dob = require('../data/dob');
const identifier = require('../data/identifier');
const names = require('../data/names');
const search = require('../data/search.js');
const utils = require('../data/utils.js');
const audit = require('../data/audit');

const availableSearchOptions = exports.availableSearchOptions = {
    identifier: {
        fields: ['prisonNumber'],
        validator: identifier.validate,
        nextView: 'names',
        hints: []
    },
    names: {
        fields: ['forename', 'forename2', 'surname'],
        validator: names.validate,
        nextView: 'dob',
        hints: ['wildcard']
    },
    dob: {
        fields: ['dobOrAge', 'dobDay', 'dobMonth', 'dobYear', 'age'],
        validator: dob.validate,
        nextView: 'results',
        hints: []
    }
};

exports.getIndex = function(req, res) {
    logger.debug('GET /search');

    return res.render('search', {
        content: content.view.search
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

    const redirectUrl = url.format({'pathname': '/search/form', 'query': selectedOptions});
    return res.redirect(redirectUrl);
};

exports.getSearchForm = function(req, res) {
    const searchItems = itemsInQueryString(req.query);
    const anyUnsupportedItems = searchItems.some((item) => !availableSearchOptions[item]);

    if (anyUnsupportedItems) {
        logger.warn('No such search option', {view: req.params.view});
        return res.redirect('/search');
    }

    const hints = flatten(searchItems.map((item) => availableSearchOptions[item].hints));
    res.render('search/full-search', {
        content: content.view.search,
        searchItems,
        hints
    });
};

exports.postSearchForm = function(req, res) {

    const userInput = userInputFromSearchForm(req.body);
    const searchItems = itemsInQueryString(req.query).filter((item) => availableSearchOptions[item]);

    if(!inputValidates(searchItems, userInput)) {
        // more useful handler to be written if necessary
        // should only occur for those with JS off
        logger.info('Server side input validation used');
        return res.redirect('/search');
    }

    // /search/results to be addressed when audit table is included
    req.session.rowcount = null;
    req.session.userInput = userInput;
    res.redirect('/search/results');
};

const objectKeysInArray = (object, array) => Object.keys(object).filter((objectKey) => array.includes(objectKey));

const itemsInQueryString = (queryString) => Object.keys(queryString).map((key) => queryString[key]);

const userInputFromSearchForm = (requestBody) => {
    const getReturnedFields = composeFieldsForOptionReducer(requestBody);
    return Object.keys(availableSearchOptions).reduce(getReturnedFields, {});
};

const composeFieldsForOptionReducer = (requestBody) => (collatedData, option) => {
    const returnedFields = availableSearchOptions[option].fields.filter((field) => requestBody[field]);

    returnedFields.forEach((field) => collatedData[field] = requestBody[field].trim());
    return collatedData;
};

const inputValidates = (searchItems, userInput) => {
    return !searchItems.some((item) => availableSearchOptions[item].validator(userInput, (err) => err));
};

const flatten = (arr) => {
    return Array.prototype.concat(...arr);
};

// original function
// to be updated to use audit table rather than session
exports.getResults = function(req, res) {
    logger.info('GET /search/results');

    if (!req.headers.referer) {
        res.redirect('/search');
        return;
    }

    let userInput = req.session.userInput;
    let page = getCurrentPage(req);
    req.session.lastPage = page;

    if (req.session.rowcount) {
        let rowcount = req.session.rowcount;

        if (isValidPage(page, rowcount)) {
            return getListOfInmates(rowcount);
        }

        res.redirect('/search');
        return;
    }

    audit.record('SEARCH', req.user.email, userInput);

    search.totalRowsForUserInput(userInput, function(err, rowcount) {
        if (err) {
            logger.error('Error during search', {error: err});
            return showDbError(res);
        }

        if (rowcount === 0) {
            return renderResultsPage(req, res, rowcount);
        }

        req.session.rowcount = rowcount;
        getListOfInmates(rowcount);

    });

    function getListOfInmates(rowcount) {
        userInput.page = page;
        search.inmate(userInput, function(err, data) {
            if (err) {
                logger.error('Error during search', {error: err});
                return showDbError(res);
            }

            renderResultsPage(req, res, rowcount, data);
        });
    }

    function showDbError(res) {
        let _err = {
            title: content.errMsg.DB_ERROR,
            desc: content.errMsg.DB_ERROR_DESC
        };

        res.status(500);
        res.render('search', {
            err: _err,
            content: content.view.search
        });
    }
};

function isValidPage(page, rowcount) {
    if (Number.isNaN(parseInt(page))) {
        return false;
    }

    return !(rowcount > 0 && page > Math.ceil(rowcount / utils.resultsPerPage));
}

function renderResultsPage(req, res, rowcount, data) {
    res.render('search/results', {
        content: {
            title: getPageTitle(rowcount)
        },
        view: req.params.v,
        pagination: (rowcount > utils.resultsPerPage ) ? utils.pagination(rowcount, getCurrentPage(req)) : null,
        data: data
    });
}

function getCurrentPage(req) {
    const page = Number(req.query.page);
    return Number.isNaN(page) ? 1 : req.query.page;
}

function getPageTitle(rowcount) {

    let oResultsPageContent = content.view.results;

    if (rowcount === 0) {
        return oResultsPageContent.title_no_results;
    }

    let title = oResultsPageContent.title;
    if (rowcount > 1) {
        title += 's';
    }

    return title.replace('_x_', rowcount);
}


