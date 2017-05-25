'use strict';

const expect = require('chai').expect;
const {describeCode} = require('../data/codes.js');

describe('Code description lookup', function() {


    it('should return unknown when empty value given', function() {
        expect(describeCode('MARITAL_STATUS', ''))
            .to.equal(null);
    });

    it('should return unknown when no value given', function() {
        expect(describeCode('MARITAL_STATUS'))
            .to.equal(null);
    });

    it('should return unknown when no code set given', function() {
        expect(describeCode('', 'value'))
            .to.equal(null);
    });

    it('should return unknown when no match for the value in the code set', function() {
        expect(describeCode('MARITAL_STATUS', 'no-such-value'))
            .to.equal(null);
    });

    it('should return description matching the given value', function() {
        expect(describeCode('MARITAL_STATUS', 'S'))
            .to.equal('Single');
        expect(describeCode('MARITAL_STATUS', 'W'))
            .to.equal('Widowed');
    });

    it('should return description matching the given value when value is some spaces', function() {
        expect(describeCode('MARITAL_STATUS', ' '))
            .to.equal(null);
    });
});
