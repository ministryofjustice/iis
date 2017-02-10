var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    
    if(!req.session.logged_in){
        res.redirect('/login')
        return;
    }
    
    console.log('eh')
        
    res.render('results', {nav: true});
});



module.exports = router;



