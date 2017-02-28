var express = require('express');
var router = express.Router();
var content = require('../data/content.js');
var search = require('../data/search.js');
var dob = require('../data/dob.js');
var identifier = require('../data/identifier.js');
var names = require('../data/names.js');

router.get('/', function(req, res){    
    res.render('search', {title: 'Search'});
});

router.post('/', function (req, res) { 
    if(!req.body.opt){
        
        var _err = { title: content.err_msg.CANNOT_SUBMIT,
                     desc: content.err_msg.NO_OPTION_SELECTED  };
        
        res.render('search', {title: 'Search', err: _err});
        return;
    }

    req.session.opt = Array.isArray(req.body.opt) ? req.body.opt : [req.body.opt];
    req.session.user_input = {};
    
    res.redirect('/search/'+req.session.opt[0]);
});


router.get('/results', function (req, res) {
    //TODO: what if session has no user input?
    search.inmate(req.session.user_input, function(err, data){
        
        //TODO: show message
        if(err){
            res.redirect('/search');
            return;
        }
        
        res.render('search/results', {
            title: (data != 0 ? data.length : '0') + ' Results',
            view: req.params.v,
            data: data
        });
    });
});

const options = {
    identifier: {
        title: "Enter at least one unique identifier",
        fields: ["prison_number"],
        validator: identifier.validate,
        nextView: "names",
    },
    names: {
        title: "Enter at least one name",
        fields: ["forename", "forename2", "surname"],
        validator: names.validate,
        nextView: "dob",
    },
    dob: {
        title: "Enter inmate's date of birth or age/range",
        fields: ["dobOrAge", "dob_day", "dob_month", "dob_year", "age"],
        validator: dob.validate,
        nextView: "results"
    },
};


router.get('/:view', function (req, res) {
    
    const view = req.params.view;

    if(!options[view]){
        res.redirect('/search');
        return;
    }

    res.render('search/' + view, {
        title: options[view].title,
        view: view,
        body: {},
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
        delete req.session.user_input[field];
        input[field] = String(req.body[field] || "").trim();
    });
    
    viewInfo.validator(input, function(err) {
        if(err) {
            renderViewWithErrorAndUserInput(req, res, view, err);
            return;
        }
        
        Object.assign(req.session.user_input, input);
        
        proceedToTheNextView(req, res, view);
    });
});

function renderViewWithErrorAndUserInput(req, res, viewName, err){
    res.render('search/'+viewName, {
        title: options[viewName].title, 
        view: viewName, 
        err: err,
        body: req.body
    });
}

function proceedToTheNextView(req, res, currView){
    var nextView = options[currView].nextView;

    if (nextView != "results" && req.session.opt.indexOf(nextView) === -1) {
        proceedToTheNextView(req, res, nextView);
        return;
    }
        
    res.redirect('/search/' + nextView); 
}



module.exports = router;
