var express = require('express');
var router = express.Router();
var content = require('../data/content.js');
var search = require('../data/search.js');
var dob = require('../data/dob.js');
var identifier = require('../data/identifier.js');
var names = require('../data/names.js');

router.get('/', function(req, res){    
    res.render('search', {content: content.view.search});
});

router.post('/', function (req, res) {

    if(!req.body.opt){
        
        var _err = { title: content.errMsg.CANNOT_SUBMIT,
                     desc: content.errMsg.NO_OPTION_SELECTED  };
        
        res.render('search', {err: _err, content: content.view.search});
        return;
    }

    req.session.opt = Array.isArray(req.body.opt) ? req.body.opt : [req.body.opt];
    req.session.userInput = {};

    res.redirect('/search/'+req.session.opt[0]);
});


router.get('/results', function (req, res) {
    //TODO: what if session has no user input?
    search.inmate(req.session.userInput, function(err, data){

        //TODO: show message
        if(err){
            res.redirect('/search');
            return;
        }

        res.render('search/results', {
            content: {title: content.view.results.title.replace('_x_',(data !== 0 ? data.length : '0'))},
            view: req.params.v,
            data: data
        });
    });
});

const options = {
    identifier: {
        fields: ["prisonNumber"],
        validator: identifier.validate,
        nextView: 'names'
    },
    names: {
        fields: ["forename", "forename2", "surname"],
        validator: names.validate,
        nextView: 'dob'
    },
    dob: {
        fields: ["dobOrAge", "dobDay", "dobMonth", "dobYear", "age"],
        validator: dob.validate,
        nextView: 'results'
    }
};


router.get('/:view', function (req, res) {

    const view = req.params.view;

    if(!options[view]){
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
        res.redirect('/search');
        return;
    }

    const input = {};
    viewInfo.fields.forEach(function(field) {
        delete req.session.userInput[field];
        input[field] = String(req.body[field] || '').trim();
    });

    viewInfo.validator(input, function(err) {
        if(err) {
            renderViewWithErrorAndUserInput(req, res, view, err);
            return;
        }

        Object.assign(req.session.userInput, input);

        proceedToTheNextView(req, res, view);
    });
});

function renderViewWithErrorAndUserInput(req, res, viewName, err){
    res.render('search/'+viewName, {
        content: content.view[viewName], 
        view: viewName, 
        err: err,
        body: req.body
    });
}

function proceedToTheNextView(req, res, currView){
    var nextView = options[currView].nextView;

    if (nextView !== 'results' && req.session.opt.indexOf(nextView) === -1) {
        proceedToTheNextView(req, res, nextView);
        return;
    }

    res.redirect('/search/' + nextView);
}


module.exports = router;
