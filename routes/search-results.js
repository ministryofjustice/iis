var express = require('express');
var router = express.Router();

router.get('/results', function (req,res){ 
    if(!req.session.logged_in){
        res.redirect('/login')
        return;
    }
    
    res.render('results', {title: 'XX Results', nav: true});
});


module.exports = router;
