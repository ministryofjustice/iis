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
    },
    
    resultsPerPage: 5,
    
    pagination: function(rowcount, currPage) {
        currPage = (currPage) ? currPage : 1;
        
        let totalPages = Math.ceil(rowcount / this.resultsPerPage);
        let showPrev = (currPage - 1) == 0 ? false : true;
        let showNext = currPage == totalPages ? false : true;
        
        return {totalPages: totalPages, 
                currPage: currPage, 
                showPrev: showPrev, 
                showNext: showNext};
    }

};
