var fakeDB;

module.exports = {
    connect: function(){
        if (fakeDB) {
            return fakeDB;
        }
        
        var config = require("./config");        
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
    setFake: function(fake) {
        fakeDB = fake;
    },
    
    disconnect: {}
};