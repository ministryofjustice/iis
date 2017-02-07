var fakeDBFactory;

module.exports = {
    connect: function(){
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
                database: config.db.database
            },
        });
        
        return connection;
    },
    setFakeFactory: function(fakeFactory) {
        fakeDBFactory = fakeFactory;
    },
    
    disconnect: {}
};