'use strict';

module.exports = {
    pad: function(n) {
        return (n < 10) ? ('0' + parseInt(n)) : n;
    },

    getDateRange: function(v) {
        let thisYear = parseInt(new Date().getFullYear());

        if (v.indexOf('-') === -1) {
            return [(thisYear - v) + '0101', (thisYear - v) + '1231'];
        }

        v = v.split('-');
        return [(thisYear - v[1]) + '0101', (thisYear - v[0]) + '1231'];
    }

};
