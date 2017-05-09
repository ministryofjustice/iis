'use strict';

const expect = require('chai').expect;
const codes = require("../data/codes.js");

const aCodeSet = {
    "A": "FIRST",
    "TWO": "SECOND",
    " ": "EMPTY"
}

describe('Code description lookup', function() {


    it('should return unknown when empty value given', function() {
        expect(codes.describe(aCodeSet, ''))
            .to.equal('Unknown');
    });

    it('should return unknown when no value given', function() {
        expect(codes.describe(aCodeSet))
            .to.equal('Unknown');
    });

    it('should return unknown when empty code set given', function() {
        expect(codes.describe({}, 'value'))
            .to.equal('Unknown');
    });

    it('should return unknown when no code set given', function() {
        expect(codes.describe('', 'value'))
            .to.equal('Unknown');
    });

    it('should return unknown when no match for the value in the code set', function() {
        expect(codes.describe(aCodeSet, 'no-such-value'))
            .to.equal('Unknown');
    });

    it('should return description matching the given value', function() {
        expect(codes.describe(aCodeSet, 'A'))
            .to.equal('FIRST');
        expect(codes.describe(aCodeSet, 'TWO'))
            .to.equal('SECOND');
    });

    it('should return description matching the given value when value is some spaces', function() {
        expect(codes.describe(aCodeSet, ' '))
            .to.equal('EMPTY');
    });
});
