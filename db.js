var config = require("./config");

module.exports = {
    connect: function(){
        
        var connection = require('tedious').Connection;
        
        connection = new connection({
            userName: config.db.username,
            password: config.db.password,
            server: config.db.server,
            options: {
                encrypt: true,
                database: config.db.database
            },
        });
        
        return connection;
    },
    
    disconnect: {}
};