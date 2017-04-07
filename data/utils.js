'use strict';
let moment = require('moment');
let url = require('url');
let changeCase = require('change-case');

const acronyms = ['HDC', 'ARD'];

module.exports = {

    pad: function(n) {
        return (n < 10) ? ('0' + parseInt(n)) : n;
    },
    
    padPrisonNumber: function(v) {
        let spaces = '';
        const lenPrisonNumber = 8;
        
        for(let i=0; i < lenPrisonNumber-v.length; i++) {
            spaces += ' ';
        }
        
        return (v.length < lenPrisonNumber) ? (spaces + v) : v;
    },
    
    getAgeFromDOB: function(dateInGDSFormat) {
        let dob = moment(dateInGDSFormat, 'DD/MM/YYYY');
        return moment().diff(dob, 'years', false);
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

        let ages = age.split('-');
        let startDate = this.getCurrentTime()
                        .subtract(ages[1], 'years')
                        .subtract(1, 'years')
                        .add(1, 'days')
                        .format('YYYYMMDD');
        
        let endDate = this.getCurrentTime().subtract(ages[0], 'years').format('YYYYMMDD');
        return [startDate, endDate];
    },
    
    resultsPerPage: 5,
    
    pagination: function(rowCount, currPage) {
        currPage = (currPage) ? currPage : 1;
        
        let totalPages = Math.ceil(rowCount / this.resultsPerPage);
        let showPrev = (currPage - 1) == 0 ? false : true;
        let showNext = currPage == totalPages ? false : true;
        
        return {totalPages: totalPages, 
                currPage: currPage, 
                showPrev: showPrev, 
                showNext: showNext};
    },
    
    getCurrentTime: function() {
        return moment();
    },
    
    getFormattedDateFromString: function(dateAsIISDateFormat) {
        return dateAsIISDateFormat == '18991231' ? null : moment(dateAsIISDateFormat, 'YYYYMMDD').format('DD/MM/YYYY');
    },
    
    getPathFromURL: function(v) {
        return url.parse(v).path;
    },
    
    acronymsToUpperCase: function(text) {
        return acronyms.map(function(acronym){
            let regex = new RegExp(acronym, 'gi');
            text = text.replace(regex, changeCase.upperCase(acronym));
            return text;
        }).pop();
    }
};
