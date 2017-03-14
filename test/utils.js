'use strict';

let expect = require('chai').expect;
let utils = require("../data/utils");

describe('Utility methods', function () {

    it('should add leading zero if a single digit is passed', function () {
        expect(utils.pad(9)).to.equal('09')
    });

    it('should not add leading zero if a double digit is passed', function () {
        expect(utils.pad(19)).to.equal(19)
    });

    it('should return an array when an age has been passed', function () {
        let thisYear = parseInt(new Date().getFullYear());
        expect(utils.getDateRange('36'))
            .to.be.an("array")
            .to.contain((thisYear - 36) + "0101")
            .to.contain((thisYear - 36) + "1231");
    });

    it('should return an array when an age range has been passed', function () {
        let thisYear = parseInt(new Date().getFullYear());
        expect(utils.getDateRange('36-40'))
            .to.be.an("array")
            .to.contain((thisYear - 40) + "0101")
            .to.contain((thisYear - 36) + "1231");
    });
    
    let pagePosition = 1,
        resultsPerPage = 5,
        rows = 9;
    
    it('should return a total of 2 pages for the above settings', function () {
       expect(utils.pagination(rows, pagePosition).totalPages)
           .to.equal(2)
    });
    
    it('should return same position as being passed', function () {
       expect(utils.pagination(rows, pagePosition).currPage)
           .to.equal(1)
    });
    
    it('should return showPrev=false when page position is at 1', function () {
       expect(utils.pagination(rows, pagePosition).showPrev)
           .to.equal(false)
    });
    
    it('should return showPrev=true when page position is at 2', function () {
       expect(utils.pagination(rows, pagePosition+1).showPrev)
           .to.equal(true); 
    });
    
    it('should return showNext=true when page position is at 1', function () {
       expect(utils.pagination(rows, pagePosition).showNext)
           .to.equal(true); 
    });
    
    it('should return showNext=false when page position is at 2', function () {
       expect(utils.pagination(rows, pagePosition+1).showNext)
           .to.equal(false); 
    });
});
