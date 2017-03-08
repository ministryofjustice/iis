'use strict';

let express = require('express');
let content = require('../data/content.js');
let search = require('../data/search.js');
let dob = require('../data/dob.js');
let identifier = require('../data/identifier.js');
let names = require('../data/names.js');

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

    // TODO: what if session has no user input?
    search.inmate(req.session.userInput, function(err, data) {

        // TODO: show message
        if (err) {
            logger.error('Error during search: ' + err);
            res.redirect('/search');
            return;
        }

        res.render('search/results', {
            content: {
                title: content.view.results.title.replace('_x_', (data !== 0 ? data.length : '0'))
            },
            view: req.params.v,
            data: data
        });
    });
});

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
