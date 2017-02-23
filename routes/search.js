var express = require('express');
var router = express.Router();
var content = require('../data/content.js');
var search = require('../data/search.js');

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



router.post('/:v', function (req, res) {
    const flow = { identifier: "names",
                   names: "dob",
                   dob: "results" };
    
     var next_page = "results",
         curr_page = req.body.this_page,
         form_val = {};

    
    switch (curr_page){
            

            
        case 'identifier':
            form_val.prison_number = req.body.prison_number;
            delete req.session.user_input['prison_number'];
            
            if( !validate(form_val.prison_number, 'prison_number') ){
                var _err = { title: content.err_msg.CANNOT_SUBMIT,
                             desc : content.err_msg.INVALID_ID,
                             items: [{prison_number: 'Re-enter the prison number'}]};
                                
                res.render('search/'+curr_page, 
                           {title: views[curr_page], 
                            nav: true, view: curr_page, 
                            err: _err,
                            form_val: form_val});
                return;
            }
            
            req.session.user_input.prison_number = form_val.prison_number;
                    
            break;
            
            
            
        case 'names':
            
                delete req.session.user_input['forename'];
                delete req.session.user_input['forename2'];
                delete req.session.user_input['surname'];
                
                form_val.forename = req.body.forename.trim(),
                form_val.forename2 = req.body.forename2.trim(),
                form_val.surname = req.body.surname.trim();
            
                var _err = {};

                if(form_val.forename == '' && form_val.forename2 == '' && form_val.surname == ''){
                    _err = { title: content.err_msg.CANNOT_SUBMIT,
                             desc : content.err_msg.ATLEAST_ONE_REQUIRED,
                             items: [{forename: 'Enter forename'},
                                     {forename2: 'Enter middle name'},
                                     {surname: 'Enter surname'}]};

                    res.render('search/'+curr_page, 
                               {title: views[curr_page], 
                                nav: true, 
                                view: curr_page, 
                                err: _err});
                    return;

                } 

            
                /* VALIDATE INPUT STRING */
                
                var _e = 0;
            
                _err.items = [];

                if(!validate(form_val.forename, 'string')){
                    _err.items[_e] = {forename: 'Correct the forename'};
                    _e++;
                }

                if(!validate(form_val.forename2, 'string')){
                    _err.items[_e] = {forename2: 'Correct the middle name'};
                    _e++;
                }

                if(!validate(form_val.surname, 'string')){
                    _err.items[_e] = {surname: 'Correct the surname'};
                    _e++;
                }

                if(_e > 0){

                    _err.title = content.err_msg.CANNOT_SUBMIT;
                    _err.desc  = content.err_msg.LETTERS_ONLY; 
                    
                    res.render('search/'+curr_page, 
                               {title: views[curr_page], 
                                nav: true, 
                                view: curr_page, 
                                err: _err,
                                form_val: form_val});

                    return;
                }

                if(form_val.forename != '')
                    req.session.user_input.forename = form_val.forename;
            
                if(form_val.forename2 != '')
                    req.session.user_input.forename2 = form_val.forename2;
            
                if(form_val.surname != '')
                    req.session.user_input.surname = form_val.surname;

            break;
            
            
            
            
        case 'dob':
            
            var _e = 0,
                _err = {};
            
            _err.items = [];
            
            delete req.session.user_input['age_or_dob'];
            
            if(req.body.opt == 'dob'){
                
                form_val.opt = 'dob';
                form_val.dob_day = req.body.dob_day.trim(),
                form_val.dob_month = req.body.dob_month.trim(), 
                form_val.dob_year = req.body.dob_year.trim(),
                date_str = form_val.dob_day + '/' + form_val.dob_month + '/' + form_val.dob_year;

                if(!validate(date_str, 'date')){
                    _err.items = [{dob_day: 'Enter date of birth'}],
                    _err.desc = content.err_msg.INVALID_DOB;
                    _e++;
                } else {
                    var date = new Date();
                    date.setDate(form_val.dob_day);
                    date.setMonth(form_val.dob_month-1);
                    date.setFullYear(form_val.dob_year);
                    
                    if(date > Date.now()){
                        _err.items = [{dob_day: 'Date of birth cannot be in the future'}],
                        _err.desc = content.err_msg.INVALID_DOB;
                        _e++;
                    }
                }
            } else {
                var age_range = req.body.age_range.replace(/ /g,'');
                
                form_val.opt = 'age';
                form_val.age_range = age_range;
                
                if(!validate(age_range, 'age-or-range') ){
                    _err.items = [{age_range: 'Re-enter age or range'}],
                    _err.desc = content.err_msg.INVALID_DOB;
                    _e++;
                } else {
                    if (age_range.indexOf('-') === -1){
                        
                        var year_of_birth = parseInt(new Date().getFullYear()) - age_range;
                        age_range = [year_of_birth+'0101',year_of_birth+'1231'];
                        
                    } else {
                        
                        var age_range = age_range.split('-'),
                            year_of_birth_from  = parseInt(new Date().getFullYear()) - age_range[1],
                            year_of_birth_to    = parseInt(new Date().getFullYear()) - age_range[0];
                        
                        age_range = [year_of_birth_from+'0101',year_of_birth_to+'1231'];
                        
                    }
                }
            }
            
            if(_e > 0){
                
                _err.title = content.err_msg.CANNOT_SUBMIT;
                
                res.render('search/'+curr_page, 
                           {title: views[curr_page], 
                            nav: true, 
                            view: curr_page, 
                            err: _err,
                            form_val: form_val});
                return;
            }
            
            if(age_range) req.session.user_input.age_or_dob = age_range
            else req.session.user_input.age_or_dob = form_val.dob_year+pad(form_val.dob_month)+pad(form_val.dob_day);
            
            break;
            
            
        default:
            break;
    }

    if(Array.isArray(req.session.opt)){
        var found = 0;
        
        var i = 0;
        do {
            next_page = flow[curr_page];
            
            if (req.session.opt.indexOf(next_page) !== -1) found++
            else curr_page = next_page;
            
            if (curr_page == "results") found++;
        } 
        while(found < 1);
    } 
    
    res.redirect('/search/'+next_page);    
});


function search(){
    
}

function pad(n) {
    
    return (n < 10) ? ("0" + parseInt(n)) : n;
}

function validate(val, type){
    switch (type) {
        case 'prison_number':
                return /^[A-Z][A-Z]([0-9]{6})$/.test(val.toUpperCase());
                break;
            
        case 'string':
            
            if(val == '')
                return true;
            
            return /^[A-Za-z]+$/.test(val);
            break;

        case 'age-or-range':
            if (!/^[1-9][0-9]$|^[1-9][0-9]-[1-9][0-9]$/.test(val))
                return false;
            
            if (val.indexOf('-') === -1) return true;
            else {
                val = val.split('-');
                if(val[0]>val[1])
                    return false;
                
                return true;
            }
                
            break;
            
            
        case 'date':
            return /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(val)
            break;
            
        default:
            break;
    }
}

module.exports = router;
