var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    if(!req.session.logged_in){
        res.redirect('/login')
        return;
    }

    var view = 'search',
        sub_view_title,
        sub_views = { pnc: "Enter the inmate's PNC number", dob: "When was the inmate born?", names: "Enter at least one of the following" };
    
    if(req.query.p){
        view = 'search/wrapper-view';
        sub_view_title = sub_views[req.query.p];
        
        
        if(!sub_view_title)
            res.redirect('/search')
    } else {
        req.session.search_route = undefined;
    }
    
    res.render(view, {sub_view: req.query.p, sub_view_title: sub_view_title, nav: true});
});


router.post('/', function (req, res) {    

    var next_page;
    
    
    if(req.query.p){
        
        if(req.session.search_route){
            var currpage = req.session.search_route.indexOf(req.query.p);
            if(currpage+1 < req.session.search_route.length){
                next_page = req.session.search_route[++currpage];
                res.redirect('/search/?p='+next_page);
            } else {
                res.redirect('/results');
            }
        } else {
            res.redirect('/results');
        }
        
    } else {
        
        if(req.body.opt && Array.isArray(req.body.opt)){
            if(!req.session.search_route){
                req.session.search_route = req.body.opt;
                next_page = req.session.search_route[0];
            }
            
            res.redirect('/search/?p='+next_page)
        } else if(req.body.opt){
            next_page = req.body.opt;
            res.redirect('/search/?p='+next_page)
        } else {
            res.render('search', {nav: true, msg: 'Select at least one parameter'});
        }
        
    }


    
});


module.exports = router;
