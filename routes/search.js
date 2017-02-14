var express = require('express');
var router = express.Router();



router.get('/', function(req, res){    
    res.render('search', {title: 'Search', nav: true});
});


router.get('/:v', function (req, res) {
    const views = {pnc: "Enter the inmate's PNC number", 
                   dob: "When was the inmate born?", 
                   names: "Enter at least one of the following",
                   results: "XX Results"};
    
    
    
    if(!views[req.params.v]){
        res.redirect('/search');
        return;
    }

    res.render('search/'+req.params.v, {title: views[req.params.v], nav: true, view: req.params.v});
});



router.post('/', function (req, res) { 
    
    if(!req.body.opt){
        res.render('search', {title: 'Search', nav: true, msg: 'Select at least one option'});
        return;
    }
    
    req.session.opt = req.body.opt;

    if(Array.isArray(req.body.opt))
        res.redirect('/search/'+req.body.opt[0]);
    else
        res.redirect('/search/'+req.body.opt); 
});

router.post('/:v', function (req, res) {
    const flow = { pnc: "names",
                   names: "dob",
                   dob: "results" };
    
    var next_page = "results";

    if(Array.isArray(req.session.opt)){
        var curr_page = req.body.this_page,
            found = 0;
        
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



module.exports = router;
