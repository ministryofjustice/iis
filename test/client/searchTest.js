require('jsdom-global/register');
const chai = require('chai');
const $ = require('jquery');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const proxyquire = require('proxyquire');
chai.use(sinonChai);
const content = require('../../data/content');

proxyquire.noCallThru();
const sandbox = sinon.sandbox.create();

let searchForm;

const initialPage = '<html>' +
    '<h1 id="formTitle">Form title</h1>' +
    '<div class="back-link-container"><a href="">Back</a></div>' +
    '<form name="search-prisoner-form" method="post">' +
    '<div class="searchPrisonerItem"><input id="prisonNumber" type="text" name="prisonNumber"></div>' +
    '<div class="searchPrisonerItem"><input id="forename" type="text" name="forename"></div>' +
    '<div class="searchPrisonerItem"><input id="optDob" type="text" name="optDob"></div>' +
    '<div><button id="continue">Continue</button></div>' +
    '</form>' +
    '<div id="namehint" class="hint namesHint"><p>Hint</p></div>' +
    '</html>';

describe('Client side search form', () => {
    let submitSpy, $continueBtn;

    afterEach(() => {
        sandbox.reset();
    });

    context('passing validation', () => {
        const isValidDobSpy = sandbox.stub().returns(null);
        const isValidNameSpy = sandbox.stub().returns(null);
        const isValidPrisonNumberSpy = sandbox.stub().returns(null);

        beforeEach(() => {
            document.body.innerHTML = initialPage;
            submitSpy = sandbox.spy();
            $continueBtn = $('#continue');

            searchForm = proxyquire('../../assets/javascripts/search/search', {
                './searchValidators': {
                    'isValidDob': isValidDobSpy,
                    'isValidName': isValidNameSpy,
                    'isValidPrisonNumber': isValidPrisonNumberSpy,
                },
            }).default;
        });

        it('should initially hide all but first item', () => {

            $.each($('.searchPrisonerItem'), (key, value) => {
                if(key === 0) {
                    expect($(value).hasClass('js-hidden')).to.equal(false);
                } else {
                    expect($(value).hasClass('js-hidden')).to.equal(true);
                }
            });
        });

        it('should initially hide hint', () => {
            expect($('#namehint').hasClass('js-hidden')).to.equal(true);
        });

        it('should show first title', () => {
            expect($('#formTitle').text()).to.equal(content.view.identifier.title);
        });

        it('should call validator for the item being submitted each item', () => {

            $continueBtn.click();
            expect(isValidPrisonNumberSpy).to.have.callCount(1);

            $continueBtn.click();
            expect(isValidNameSpy).to.have.callCount(1);

            $continueBtn.click();
            expect(isValidDobSpy).to.have.callCount(1);
        });

        it('should hide all but second after first click of continue button', () => {
            $continueBtn.click();

            $.each($('.searchPrisonerItem'), (key, value) => {
                if(key === 1) {
                    expect($(value).hasClass('js-hidden')).to.equal(false)
                } else {
                    expect($(value).hasClass('js-hidden')).to.equal(true)
                }
            })
        });

        it('should update the title', () => {
            $continueBtn.click();
            expect($('#formTitle').text()).to.equal(content.view.names.title);
        });

        it('should reveal hint when on names page', () => {
            $continueBtn.click();

            expect($('#namehint').hasClass('js-hidden')).to.equal(false);
        });

        it('should hide all but third after second click of continue button', () => {

            $continueBtn.click();
            $continueBtn.click();

            $.each($('.searchPrisonerItem'), (key, value) => {
                if(key === 2) {
                    expect($(value).hasClass('js-hidden')).to.equal(false);
                } else {
                    expect($(value).hasClass('js-hidden')).to.equal(true);
                }
            })
        });

        it('should update title after second click', () => {
            $continueBtn.click();
            $continueBtn.click();
            expect($('#formTitle').text()).to.equal(content.view.dob.title);
        });

        it('should hide hint when not on names page', () => {
            $continueBtn.click();
            $continueBtn.click();

            expect($('#namehint').hasClass('js-hidden')).to.equal(true)
        });

        it('should submit the form after all inputs have been completed', () => {

            $('form[name="search-prisoner-form"]').submit(submitSpy);

            $continueBtn.click();
            $continueBtn.click();
            expect(submitSpy).to.have.callCount(0);

            $continueBtn.click();
            expect(submitSpy).to.have.callCount(1)
        });
    });

    context('failing validation', () => {
        const error = {
            title: 'error title',
            items: [{ forename: 'Enter forename' }, { forename2: 'Enter middle name' }],
            desc: 'error description'
        };

        const isValidDobSpy = sandbox.stub().returns(error);
        const isValidNameSpy = sandbox.stub().returns(error);
        const isValidPrisonNumberSpy = sandbox.stub().returns(error);
        const searchErrorSpy = sandbox.stub().returns($('<div id="errors"></div>'));

        beforeEach(() => {
            document.body.innerHTML = initialPage;
            $continueBtn = $('#continue');

            searchForm = proxyquire('../../assets/javascripts/search/search', {
                './searchValidators': {
                    'isValidDob': isValidDobSpy,
                    'isValidName': isValidNameSpy,
                    'isValidPrisonNumber': isValidPrisonNumberSpy
                },
                './searchError': {
                    searchError: searchErrorSpy
                },
            }).default;

        });

        it('should not move on when continue is clicked', () => {
            $continueBtn.click();

            $.each($('.searchPrisonerItem'), (key, value) => {
                if(key === 0) {
                    expect($(value).hasClass('js-hidden')).to.equal(false)
                } else {
                    expect($(value).hasClass('js-hidden')).to.equal(true)
                }
            });
        });

        it('should request search error', () => {
            $continueBtn.click();

            expect(searchErrorSpy).to.have.callCount(1)

        });

        it('should display returned error', () => {
            $continueBtn.click();

            expect($('#errors').length).to.equal(1)
        });


    })
});

