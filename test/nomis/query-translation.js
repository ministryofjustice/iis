const {
    translateQuery
} = require('../../data/nomis/queryTranslator');

const chai = require('chai');
const expect = chai.expect;
const MockDate = require('mockdate');

describe('nomisQueryTranslator', () => {

    beforeEach(function() {
        MockDate.set('01/01/2000');
    });

    afterEach(function() {
        MockDate.reset();
    });

    it('should remove unrecognised terms', () => {
        const userInput = {unknownTerm: '1234'};
        expect(translateQuery(userInput)).to.eql({});
    });

    it('should remove unmapped terms', () => {
        const userInput = {
            prisonNumber: '1234'
        };

        expect(translateQuery(userInput)).to.eql({});
    });

    it('should convert simple terms by changing the name', () => {
        const userInput = {
            forename: 'first',
            forename2: 'middle',
            surname: 'last'
        };

        const expected = {
            firstName: 'first',
            middleNames: 'middle',
            lastName: 'last'
        };

        expect(translateQuery(userInput)).to.eql(expected);
    });

    it('should remove wildcard characters because nomis api does auto wildcard', () => {
        const userInput = {
            forename: '%first',
            forename2: 'mid%dle',
            surname: 'last%'
        };

        const expected = {
            firstName: 'first',
            middleNames: 'middle',
            lastName: 'last'
        };

        expect(translateQuery(userInput)).to.eql(expected);
    });

    it('should leave terms the same where no change needed', () => {
        const userInput = {
            pncNumber: '123',
            croNumber: '456'
        };

        expect(translateQuery(userInput)).to.eql(userInput);
    });

    it('should convert dob components to dob date', () => {
        const userInput = {
            dobDay: '01',
            dobMonth: '01',
            dobYear: '1980'
        };

        const expected = {dob: '1980-01-01'};
        expect(translateQuery(userInput)).to.eql(expected);
    });

    it('should convert age to dob date', () => {
        const userInput = {age: '20'};
        const expected = {dob: '1980-01-01'};
        expect(translateQuery(userInput)).to.eql(expected);
    });

    it('should convert age range to dob from date and dob to date', () => {
        const userInput = {age: '20-30'};
        const expected = {dobFrom: '1980-01-01', dobTo: '1970-01-01'};
        expect(translateQuery(userInput)).to.eql(expected);
    });
});


