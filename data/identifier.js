var content = require('./content.js');

module.exports = {
    validate: function(input, callback){
        
        var err = {title: content.err_msg.CANNOT_SUBMIT,
                    items: [{prison_number: 'Re-enter the prison number'}], 
                    desc: content.err_msg.INVALID_ID};
        
 
        if(!isPrisonNumber(input.prison_number)) return callback(err);

        return callback(null);
    }
}

function isPrisonNumber(v){
    return /^[A-Za-z][A-Za-z]([0-9]{6})$/.test(v)
}