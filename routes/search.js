var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    
    if(!req.session.logged_in){
        res.redirect('/login')
        return;
    }
        
    res.render('search');
});


module.exports = router;



