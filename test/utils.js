'use strict';

let expect = require('chai').expect;
let utils = require("../data/utils");
let moment = require('moment');
const proxyquire = require('proxyquire');
proxyquire.noCallThru();

describe('Utility methods', function() {

    let originalGetCurrentTime = null;

    before(function() {
        originalGetCurrentTime = utils.getCurrentTime;
        utils.getCurrentTime = function() {
            let now = moment();
            now.set('year', 2017);
            now.set('month', 'March');
            now.set('date', 15);
            return now;
        }
    });

    after(function() {
        utils.getCurrentTime = originalGetCurrentTime;
    });

    it('should return an array when an age has been passed', function() {
        expect(utils.getDateRange('36'))
            .to.be.an('array')
            .to.contain('19800316')
            .to.contain('19810315');
    });

    it('should return an array when an age range has been passed', function() {
        let thisYear = parseInt(new Date().getFullYear());
        expect(utils.getDateRange('36-40'))
            .to.be.an('array')
            .to.contain('19760316')
            .to.contain('19810315');
    });

    it('should add leading zero if a single digit is passed', function() {
        expect(utils.pad(9)).to.equal('09')
    });

    it('should not add leading zero if a double digit is passed', function() {
        expect(utils.pad(19)).to.equal(19)
    });


    describe('pagination', () => {

        let pagePosition = 1,
            resultsPerPage = 10,
            rows = 19;

        const pagination = proxyquire('../data/utils', {
            '../server/config': {
                'searchResultsPerPage': resultsPerPage
            }
        }).pagination;

        it('should return a total of 2 pages for the above settings', function() {
            expect(pagination(rows, pagePosition).totalPages)
                .to.equal(2)
        });

        it('should return same position as being passed', function() {
            expect(pagination(rows, pagePosition).currPage)
                .to.equal(1)
        });

        it('should return showPrev=false when page position is at 1', function() {
            expect(pagination(rows, pagePosition).showPrev)
                .to.equal(false)
        });

        it('should return showPrev=true when page position is at 2', function() {
            expect(pagination(rows, pagePosition + 1).showPrev)
                .to.equal(true);
        });

        it('should return showNext=true when page position is at 1', function() {
            expect(pagination(rows, pagePosition).showNext)
                .to.equal(true);
        });

        it('should return showNext=false when page position is at 2', function() {
            expect(pagination(rows, pagePosition + 1).showNext)
                .to.equal(false);
        });
    });

    it('should convert the accronyms to uppercase', function() {
        expect(utils.acronymsToUpperCase('Hdc is Home Detention Curfew. And ard is actual release date'))
            .to.equal('HDC is Home Detention Curfew. And ARD is actual release date')
    });

    it('should not convert the accronym letters in a word', function() {
        expect(utils.acronymsToUpperCase('This code was done by a beardy guy, chilling in a barnyard.'))
            .to.equal('This code was done by a beardy guy, chilling in a barnyard.')
    });


    describe('days to YMD', () => {

        it('should return 0d for empty', function() {
            expect(utils.daysToYMD()).to.equal('0d');
        });

        it('should return 0d for less than zero', function() {
            expect(utils.daysToYMD(-1)).to.equal('0d');
        });

        it('should return 0d for zero', function() {
            expect(utils.daysToYMD(0)).to.equal('0d');
        });

        it('should return days for less than a month', function() {
            expect(utils.daysToYMD(3)).to.equal('3d');
        });

        it('should omit days when days is 0', function() {
            // NB a month could be 28,29,30,31, and moment.js gives an approximation where
            // 31 comes out as a month but 30 or less will be days
            expect(utils.daysToYMD(31)).to.equal('1m');
            expect(utils.daysToYMD(396)).to.equal('1y 1m');
        });

        it('should omit months when months is 0', function() {
            expect(utils.daysToYMD(30)).to.equal('30d');
            expect(utils.daysToYMD(370)).to.equal('1y 4d');
        });

        it('should omit years when years is 0', function() {
            expect(utils.daysToYMD(32)).to.equal('1m 1d');
        });

        it('should omit months and days when 0', function() {
            // NB because a year could be 365 or 366 days, moment.js uses 365.25
            // so the answers are approximate and 365 comes out as 11m 30d, but 366 is 1y
            expect(utils.daysToYMD(366)).to.equal('1y');
        });

        it('should show years months and days', function() {
            expect(utils.daysToYMD(397)).to.equal('1y 1m 1d');
        });
    });
});
