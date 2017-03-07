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
    })
});
