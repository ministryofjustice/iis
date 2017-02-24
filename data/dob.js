var content = require('./content.js');

module.exports = {
    validate: function(obj, callback){
        
        var err = {title: content.err_msg.CANNOT_SUBMIT,
                    items: [{dob_day: 'Enter date of birth'}], 
                    desc: content.err_msg.INVALID_DOB};
        
        if (!isDate(obj.day+'-'+obj.month+'-'+obj.year)) return callback(err);

        var dob = new Date(obj.year, obj.month, obj.day);
        if(dob > Date.now())
            return callback(err);
        
        return callback(null);
    }
}

function isDate(v){
    return /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(v);
}