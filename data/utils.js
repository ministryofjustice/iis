'use strict';

module.exports = {

    pad: function(n) {
        return (n < 10) ? ('0' + parseInt(n)) : n;
    },
    
    getAgeFromDOB: function(strDate) {
        let today = new Date();
        let dob = new Date(strDate);
        let age = today.getFullYear() - dob.getFullYear();
        let m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    },

    getDateRange: function(age) {
        let thisYear = parseInt(new Date().getFullYear());
        let lastYear = thisYear - 1;

        if (age.indexOf('-') === -1) {
            return [(lastYear - age) + '0101', (thisYear - age) + '1231'];
        }

        let arrAge = age.split('-');
        return [(lastYear - arrAge[1]) + '0101', (thisYear - arrAge[0]) + '1231'];
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
