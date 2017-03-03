var express = require('express');
var router = express.Router();
var content = require('../data/content.js');
var subject = require('../data/subject.js');



router.get('/', function(req, res) {
    res.redirect('/search');
});

router.get('/:id', function(req, res) {
    
    var id = req.params.id;
    
    var obj = subject.details(id, function(err, data){
        
        if(err)
            res.render('subject', {
                title: content.err_msg.INVALID_ID, 
                err: {title: content.err_msg.INVALID_ID}
            });
        
        res.render('subject', {title: 'Details of ' + data.INMATE_FORENAME_1.value, subject: data});
    });

    
    
});

module.exports = router;
