var prompt = require('prompt');
var bcrypt = require('bcryptjs');



prompt.start();
prompt.get(['username', 'email'], function (err, result) {
    var pwd = Math.random().toString(36).substr(2, 8);
    bcrypt.hash(pwd, 8, function(err, hash) {
        
        
        console.log('  username: ' + result.username);
        console.log('  email: ' + result.email);
        console.log('  password: ' + pwd);
        console.log('  hash: ' + hash);
        
        
        var connection = dbconn();

        connection.on('connect', function(err) {

            if(err) { console.log(err); return; }

            var Request = require('tedious').Request;
            

            request = new Request("select * from DBO.TESTAK1;", function(err, rowCount) {
              if (err) {
                console.log(err);
              } else {
                console.log(rowCount + ' rows');
              }
            });

            request.on('row', function(columns) {
              columns.forEach(function(column) {
                console.log(column.value);
              });
            });


            connection.execSql(request);
            
            
            
        });
        
    });
});


var dbconn = function(){
    var config = require('config');
    var dbsetting = config.get('sqlserver');
    
    var Connection = require('tedious').Connection;
    

    var config = {
                    userName: dbsetting.userName, 
                    password: dbsetting.password, 
                    server: dbsetting.server, 
                    options: { encrypt: true }
                };

    return new Connection(config);
}