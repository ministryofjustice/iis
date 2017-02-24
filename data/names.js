var content = require('./content.js');

module.exports = {
    validate: function(obj, callback){
        var err = {title: content.err_msg.CANNOT_SUBMIT,
                    items: [{forename: 'Enter forename'},{forename2: 'Enter middle name'},{surname: 'Enter surname'}], 
                    desc: content.err_msg.ATLEAST_ONE_REQUIRED};
        
        
        if(obj.forename.length === 0 && obj.forename2.length === 0 && obj.surname.length === 0) return callback(err);
        
        var errCount = 0;
        
        if(obj.forename.length !== 0 && !isString(obj.forename)) err.items[errCount++] = {forename: 'Correct the forename'};
        if(obj.forename2.length !== 0 && !isString(obj.forename2)) err.items[errCount++] = {forename2: 'Correct the middle name'};
        if(obj.surname.length !== 0 && !isString(obj.surname)) err.items[errCount++] = {surname: 'Correct the surname'};
        
        if(errCount > 0)
            return callback(err);
        
        return callback(null);
    }
}


function isString(v){
    return /^[A-Za-z]+$/.test(v);
}