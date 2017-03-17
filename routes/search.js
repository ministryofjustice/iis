'use strict';

let express = require('express');
let content = require('../data/content.js');
let search = require('../data/search.js');
let dob = require('../data/dob.js');
let identifier = require('../data/identifier.js');
let names = require('../data/names.js');
let utils = require('../data/utils.js');

let logger = require('winston');

// eslint-disable-next-line
let router = express.Router();

router.get('/', function(req, res) {
    res.render('search', {
        content: content.view.search
    });
});

router.post('/', function(req, res) {

    if (!req.body.opt) {

        logger.info('Search: No search option supplied');

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

    req.session.opt = Array.isArray(req.body.opt) ? req.body.opt : [req.body.opt];
    req.session.userInput = {};

    res.redirect('/search/' + req.session.opt[0]);
});


router.get('/results', function(req, res) {
    
    if(req.headers.referer == undefined) {
        res.redirect('/search');
        return;
    }
    
    let userInput = req.session.userInput;    
    let page = getCurrentPage(req);
    
    if(req.session.rowcount) {
        let rowcount = req.session.rowcount;
        
        if(isValidPage(page, rowcount)) {
            return getListOfInmates(rowcount);
        }
        
        res.redirect('/search');
        return;
    } 

    search.totalRowsForUserInput(userInput, function(err, rowcount) {
        // TODO: show message
        if (err) {
            logger.error('Error during search: ' + err);
            res.redirect('/search');
            return;
        }

        if(rowcount == 0) {
            renderResultsPage(req, res, rowcount);
            return;
        }

        req.session.rowcount = rowcount;
        getListOfInmates(rowcount);

    });

    function getListOfInmates(rowcount) {
        userInput.page = page;
        search.inmate(userInput, function(err, data) {
            // TODO: show message
            if (err) {
                logger.error('Error during search: ' + err);
                res.redirect('/search');
                return;
            } 

            renderResultsPage(req, res, rowcount, data);
        });
    }
});

function getCurrentPage(req) {
    return (req.query.page) ? req.query.page : 1;
}

function isValidPage(page, rowcount) {
    if(parseInt(page) == NaN) {
        return false;
    }
    
    if(rowcount > 0 && page > Math.ceil(rowcount / utils.resultsPerPage)) {
        return false;
    }
    
    return true;
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

function getPageTitle(rowcount) {
    
    let oResultsPageContent = content.view.results;
    
    if(rowcount == 0) {
        return oResultsPageContent.title_no_results;
    }
    
    let title = oResultsPageContent.title;
    
    if(rowcount > 1) {
        title += 's';
    }
    
    return title.replace('_x_', rowcount);
}


const options = {
    identifier: {
        fields: ['prisonNumber'],
        validator: identifier.validate,
        nextView: 'names'
    },
    names: {
        fields: ['forename', 'forename2', 'surname'],
        validator: names.validate,
        nextView: 'dob'
    },
    dob: {
        fields: ['dobOrAge', 'dobDay', 'dobMonth', 'dobYear', 'age'],
        validator: dob.validate,
        nextView: 'results'
    }
};


router.get('/:view', function(req, res) {
    
    req.session.rowcount = null;

    const view = req.params.view;
    const viewInfo = options[view];

    if (!viewInfo) {
        logger.warn('No such search option: ' + view);
        res.redirect('/search');
        return;
    }

    res.render('search/' + view, {
        content: content.view[view],
        view: view,
        body: {}
    });
});

router.post('/:view', function(req, res) {

    const view = req.params.view;
    const viewInfo = options[view];

    if (!viewInfo) {
        logger.warn('No such search option: ' + view);
        res.redirect('/search');
        return;
    }

    const input = {};

    viewInfo.fields.forEach(function(field) {
        delete req.session.userInput[field];
        input[field] = String(req.body[field] || '').trim();
    });

    viewInfo.validator(input, function(err) {
        if (err) {
            // TODO: Record details in the db
            logger.info('Input validation error: ' + err);
            renderViewWithErrorAndUserInput(req, res, view, err);
            return;
        }

        Object.assign(req.session.userInput, input);

        proceedToTheNextView(req, res, view);
    });
});

function renderViewWithErrorAndUserInput(req, res, viewName, err) {
    res.render('search/' + viewName, {
        content: content.view[viewName],
        view: viewName,
        err: err,
        body: req.body
    });
}

function proceedToTheNextView(req, res, currView) {
    let nextView = options[currView].nextView;

    if (nextView !== 'results' && req.session.opt.indexOf(nextView) === -1) {
        proceedToTheNextView(req, res, nextView);
        return;
    }

    res.redirect('/search/' + nextView);
}


module.exports = router;
