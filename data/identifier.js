var content = require('./content.js');

module.exports = {
    validate: function(val, callback){
        
        var err = {title: content.err_msg.CANNOT_SUBMIT,
                    items: [{prison_number: 'Re-enter the prison number'}], 
                    desc: content.err_msg.INVALID_ID};
        
        console.log(val)
        
        if(!isPrisonNumber(val)) return callback(err);
        
        return callback(null);
    }
}

function isPrisonNumber(v){
    return /^[A-Z][A-Z]([0-9]{6})$/.test(v)
}