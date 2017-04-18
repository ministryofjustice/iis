require('jsdom-global/register');
const searchError = require('../../assets/javascripts/search/searchError');
const chai = require('chai');
const $ = require('jquery');
const expect = chai.expect;

describe('Client side search form', () => {

    const error = {
        title: 'error title',
        items: [{ forename: 'Enter forename' }, { forename2: 'Enter middle name' }],
        desc: 'error description'
    };
    const expectedOutput = '' +
        '<div id="errors" class="error-summary" role="group" aria-labelledby="error-message" tabindex="-1">' +
        '<h1 class="heading-medium error-summary-heading" id="error-message">error title</h1>' +
        '<p class="errorDesc">error description</p>' +
        '<ul class="error-summary-list">' +
            '<li><a href="#forename">Enter forename</a></li>' +
            '<li><a href="#forename2">Enter middle name</a></li>' +
        '</ul>' +
    '</div>'

    describe('searchError', () => {
        it('should return the error html', () => {
            const output = searchError.searchError(error);
            const outputhtml = $(output).clone().wrap('<span>').parent().html();

            expect(outputhtml).to.eql(expectedOutput)
        });

    });
});

