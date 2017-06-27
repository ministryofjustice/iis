require('jsdom-global/register');
const chai = require('chai');
const $ = require('jquery');
const expect = chai.expect;

const initialPage = '<html>' +
    '<ul id="prisonerInfoSummary">' +
    '<li>item 1</li>' +
    '<li class="initiallyHidden">item 2</li>' +
    '<li class="initiallyHidden">item 3</li>' +
    '</ul>' +
    '</html>';

describe('moreless', () => {

    before(() => {
        document.body.innerHTML = initialPage;
        require('../../assets/javascripts/moreless/moreless');
    });

    it('should initially hide all with class of initiallyHidden', () => {
        $.each($('#prisonerInfoSummary li'), (key, value) => {
            if(key === 0) {
                expect($(value).hasClass('js-hidden')).to.equal(false);
            } else if(key === 1 || key === 2) {
                expect($(value).hasClass('js-hidden')).to.equal(true);
            }
        });
    });

    it('should attach a more/less button', () => {
        expect($('#prisonerInfoSummary li').last().html()).to.eql('<a>more</a>');
    });

    it('should change text to less on click', () => {
        $('#moreless a').click();

        expect($('#prisonerInfoSummary li').last().html()).to.eql('<a>less</a>');
    });

    it('should reveal hidden items on click', () => {
        $.each($('#prisonerInfoSummary li'), (key, value) => {
            if(key === 0 || key === 1 || key === 2) {
                expect($(value).hasClass('js-hidden')).to.equal(false);
            }
        });
    });

    it('should change text to more on second click', () => {
        $('#moreless a').click();
        expect($('#prisonerInfoSummary li').last().html()).to.eql('<a>more</a>');
    });

    it('should hide hideable items on click', () => {
        $.each($('#prisonerInfoSummary li'), (key, value) => {
            if(key === 0) {
                expect($(value).hasClass('js-hidden')).to.equal(false);
            } else if(key === 1 || key === 2) {
                expect($(value).hasClass('js-hidden')).to.equal(true);
            }
        });
    });
});
