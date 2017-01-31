var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    req.session.logged_in = 0;
    var msg = '';
    if(req.query.r && req.query.r == 'fail' )
        msg = 'Invalid credentials.  Try again';

    res.render('index', { title: 'Sign in', msg: msg});
});



router.get('/search', function (req, res) {
    if(req.session.logged_in !== 1){
        res.redirect('/')
        return;
    }
        
    res.render('search');
})

router.post('/', function (req, res) {    
    var login_id = req.body.login_id,
        pwd = req.body.pwd;
        
    if(login_id == '' || pwd == '')
        res.redirect('/')
    else {
        var oDBConfig = dbconfig();
            
        var connection = require('tedious').Connection;
            connection = new connection({
            userName: oDBConfig.userName,
            password: oDBConfig.password,
            server: oDBConfig.server,
            options: {
                encrypt: true,
                database: oDBConfig.database
            },
        });
        
        connection.on('connect', function(err) {

            if(err) { console.log(err); return; }
            
            var Request = require('tedious').Request;
            var TYPES = require('tedious').TYPES; 
            var bcrypt = require('bcryptjs');
            
            request = new Request("SELECT pwd from DBO.users WHERE login_id=@login_id;", function(err, rowCount) {
              if (err) {
                console.log(err);
              } else {
                if(rowCount === 0)
                    res.redirect('/?r=fail');
              }
            });
            
            request.addParameter('login_id', TYPES.VarChar, login_id);  

            request.on('row', function(columns) {
                var hash = columns[0].value;
                bcrypt.compare(pwd, hash, function(err, outcome) {
                    if(outcome === true){ 
                        req.session.logged_in = 1;
                        res.redirect('/search');
                    } else {
                        res.redirect('/?r=fail');
                    }
                });
            });

            connection.execSql(request);
        });
        
    }
});

var dbconfig = function(){
    var config = require('config');
    return config.get('sqlserver');
}


module.exports = router;



