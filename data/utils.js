'use strict';
let moment = require('moment');

module.exports = {

    pad: function(n) {
        return (n < 10) ? ('0' + parseInt(n)) : n;
    },
    
    getAgeFromDOB: function(strDate) {
        return moment().diff(strDate, 'years', false);
    },

    getDateRange: function(age) {
        if (age.indexOf('-') === -1) {
            let startDate = this.getCurrentTime()
                            .subtract(age, 'years')
                            .subtract(1, 'years')
                            .add(1, 'days')
                            .format('YYYYMMDD');
            
            let endDate = this.getCurrentTime().subtract(age, 'years').format('YYYYMMDD');
            return [startDate, endDate];
        }

        let arrAge = age.split('-');
        let startDate = this.getCurrentTime()
                        .subtract(arrAge[1], 'years')
                        .subtract(1, 'years')
                        .add(1, 'days')
                        .format('YYYYMMDD');
        
        let endDate = this.getCurrentTime().subtract(arrAge[0], 'years').format('YYYYMMDD');
        return [startDate, endDate];
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
    },
    
    getCurrentTime: function() {
        return moment();
    }    
};
