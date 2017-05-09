'use strict';

const expect = require('chai').expect;
const subject = require("../data/subject.js");

const aCodeSet = {
    "A": "FIRST",
    "TWO": "SECOND",
    " ": "EMPTY"
}

describe('Code description lookup', function() {


    it('should return unknown when empty value given', function() {
        expect(subject.codeDescription(aCodeSet, ''))
            .to.equal('Unknown');
    });

    it('should return unknown when no value given', function() {
        expect(subject.codeDescription(aCodeSet))
            .to.equal('Unknown');
    });

    it('should return unknown when empty code set given', function() {
        expect(subject.codeDescription({}, 'value'))
            .to.equal('Unknown');
    });

    it('should return unknown when no code set given', function() {
        expect(subject.codeDescription('', 'value'))
            .to.equal('Unknown');
    });

    it('should return unknown when no match for the value in the code set', function() {
        expect(subject.codeDescription(aCodeSet, 'no-such-value'))
            .to.equal('Unknown');
    });

    it('should return description matching the given value', function() {
        expect(subject.codeDescription(aCodeSet, 'A'))
            .to.equal('FIRST');
        expect(subject.codeDescription(aCodeSet, 'TWO'))
            .to.equal('SECOND');
    });

    it('should return description matching the given value when value is some spaces', function() {
        expect(subject.codeDescription(aCodeSet, ' '))
            .to.equal('EMPTY');
    });
});
