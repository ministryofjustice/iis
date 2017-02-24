var express = require('express');
var router = express.Router();
var content = require('../data/content.js');
var search = require('../data/search.js');
var age = require('../data/age.js');
var dob = require('../data/dob.js');
var identifier = require('../data/identifier.js');
var names = require('../data/names.js');

const views = {identifier: "Enter at least one unique identifier", 
                   dob: "Enter inmate's date of birth or age/range", 
                   names: "Enter at least one name"};


router.get('/', function(req, res){    
    req.session.user_input = {};
    res.render('search', {title: 'Search', nav: true});
});

router.get('/results', function (req, res) {
    search.inmate(req.session.user_input, function(err, data){
        
        
        //TO DO:  show message
        if(err){
            res.redirect('/search');
            return;
        }
        
        res.render('search/results', {title: (data != 0 ? data.length : '0') + ' Results', nav: true, view: req.params.v, data: data });
    });
});


router.get('/:v', function (req, res) {
        
    if(!views[req.params.v]){
        res.redirect('/search');
        return;
    }

    res.render('search/'+req.params.v, {title: views[req.params.v], nav: true, view: req.params.v });
});



router.post('/', function (req, res) { 
    if(!req.body.opt){
        
        var _err = { title: content.err_msg.CANNOT_SUBMIT,
                     desc: content.err_msg.NO_OPTION_SELECTED  };
        
        res.render('search', {title: 'Search', nav: true, err: _err});
        return;
    }
    
    req.session.opt = req.body.opt;

    if(Array.isArray(req.body.opt))
        res.redirect('/search/'+req.body.opt[0]);
    else
        res.redirect('/search/'+req.body.opt); 
});


router.post('/identifier', function(req, res){ 
    delete req.session.user_input['prison_number'];
    
    identifier.validate(req.body.prison_number, function(err){
       cbIdentifier(req, res, err, req.body.prison_number)
    });
});


router.post('/dob', function(req, res){  
    delete req.session.user_input['age_or_dob']; // get rid of the session variable

    if(req.body.opt == 'age'){
        age.validate(req.body.age, function(err){
            cbAge(req, res, err, req.body.age)
        });
    } else {
        var date = {year: req.body.dob_year,  month: req.body.dob_month, day: req.body.dob_day};
        dob.validate(date, function(err){
            cbDob(req, res, err, date);
        });
    }
});

router.post('/names', function(req, res){
    delete req.session.user_input['forename'],
           req.session.user_input['forename2'],
           req.session.user_input['surname'];
    
    var oInput = {forename: req.body.forename.trim(), forename2: req.body.forename2.trim(), surname: req.body.surname.trim()};
    
    names.validate(oInput, function(err){
        cbNames(req, res, err, oInput)
    });
});

function proceedToTheNextView(req, res, currView){
    const flow = { identifier: "names",
                   names: "dob",
                   dob: "results" };
    
    var nextView = "results";
    
    if(Array.isArray(req.session.opt)){
        var found = 0;
        
        var i = 0;
        do {
            nextView = flow[currView];
            
            if (req.session.opt.indexOf(nextView) !== -1) found++
            else currView = nextView;
            
            if (currView == "results") found++;
        } 
        while(found < 1);
    } 
    
    res.redirect('/search/'+nextView); 
}


function cbIdentifier(req, res, err, val) {
    if(err){
        renderViewWithErrorAndUserInput(req, res, 'identifier', err);
        return;
    }
    
    req.session.user_input.prison_number = val;
    proceedToTheNextView(req, res, 'identifier');
}


function cbAge(req, res, err, val){
    if(err){
        renderViewWithErrorAndUserInput(req, res, 'dob', err);
        return;
    }

    age.getDateRange(val, function(data){
        req.session.user_input.age_or_dob = data;
        proceedToTheNextView(req, res, 'dob');
    });
}

function cbDob(req, res, err, val){
    if(err){
        renderViewWithErrorAndUserInput(req, res, 'dob', err);
        return;
    }

    req.session.user_input.age_or_dob = val.year+pad(val.month)+pad(val.day);
    proceedToTheNextView(req, res, 'dob');
}

function cbNames(req, res, err, oVal){
    if(err){
        renderViewWithErrorAndUserInput(req, res, 'names', err);
        return;
    }

    if(oVal.forename.length != 0) req.session.user_input.forename = oVal.forename;
    if(oVal.forename2.length != 0) req.session.user_input.forename2 = oVal.forename2;
    if(oVal.surname.length != 0) req.session.user_input.surname = oVal.surname;
    

    proceedToTheNextView(req, res, 'names');
}

function renderViewWithErrorAndUserInput(req, res, viewName, err){
    res.render('search/'+viewName, 
               {title: views[viewName], 
                nav: true, 
                view: viewName, 
                err: err,
                body: req.body});
}



function pad(n) {return (n < 10) ? ("0" + parseInt(n)) : n;}


module.exports = router;
