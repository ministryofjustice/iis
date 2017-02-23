var fakeDBFactory;
var connection;


module.exports = {
    setFakeFactory: function(fakeFactory) {
        fakeDBFactory = fakeFactory;
    },
    
    connect : function(){
       if (fakeDBFactory) {
        return fakeDBFactory();
        }

        var config = require("./config");        
        var connection = require('tedious').Connection;

        connection = new connection({
            userName: config.db.username,
            password: config.db.password,
            server: config.db.server,
            options: {
                encrypt: true,
                database: config.db.database,
                useColumnNames: true,
                rowCollectionOnRequestCompletion: true
            },
        });

        return connection;
    }, 
    
    getTuple: function(sql, params, callback){
    
        connection = this.connect();
        connection.on('connect', function(err) {
            if(err) return callback(err);
            
            var Request = require('tedious').Request;
            var request = new Request(sql, function(err, rowCount) {
                if (err) return callback(err);
                if(rowCount === 0) return callback(null, rowCount);
            });
            
            request.addParameter(params.column, 
                                 params.type, 
                                 params.value);  

            request.on('row', function(columns) {
                return callback(null, columns);
            });
            
            connection.execSql(request);
        });
    },
    
    getCollection: function(sql, params, callback){
        connection = this.connect();
        connection.on('connect', function(err) {
            if(err) return callback(err);
            
            var Request = require('tedious').Request;
            var request = new Request(sql, function(err, rowCount, rows) {
                            
                if (err) return callback(err);
                if(rowCount === 0) return callback(null, rowCount);
                
                return callback(null, rows)
            });
            
            
            
            if(params)
                params.forEach(function(param){
                    request.addParameter(param.column, 
                                     param.type, 
                                     param.value);  
                })

                

            connection.execSql(request);
        });
    },
    
    disconnect: function(){
        if (fakeDBFactory)
            return;
        
        connection.close();
    }
};