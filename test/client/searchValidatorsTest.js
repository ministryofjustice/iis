require('jsdom-global/register');
const chai = require('chai');
const $ = require('jquery');
const sinon = require('sinon');
const sinonChai =  require('sinon-chai');
const expect = chai.expect;
const proxyquire  = require('proxyquire');
chai.use(sinonChai);

proxyquire.noCallThru();
const sandbox = sinon.sandbox.create();
let searchValidator;

const initialPage = '<html>' +
    '<div class="back-link-container"><a href="">Back</a></div>' +
    '<form name="search-prisoner-form" method="post">' +
        '<div id="prisonNumberContainer">' +
            '<input id="prisonNumber" type="text" name="prisonNumber">' +
        '</div>' +
        '<div id="nameContainer">' +
            '<input id="forename" type="text" name="forename">' +
            '<input id="forename2" type="text" name="forename2">' +
            '<input id="surname" type="text" name="surname">' +
        '</div>' +
        '<div id="dobContainer">' +
            '<input type="radio" name="dobOrAge" id="optDob" value="dob" checked>' +
            '<input id="dobDay" name="dobDay" type="number">' +
            '<input id="dobMonth" name="dobMonth" type="number">' +
            '<input id="dobYear" name="dobYear" type="number" >' +
            '<input type="radio" name="dobOrAge" id="optAge" value="age">' +
            '<input id="age" name="age" type="text">' +
        '</div>' +
        '<div><button id="continue">Continue</button></div>' +
    '</form>' +
'</html>';

describe('Client side search form', () => {

    let dobValidatorStub, namesValidatorStub, identifierValidatorStub;

    beforeEach(() => {
        document.body.innerHTML = initialPage;
        dobValidatorStub = sandbox.stub().returns({item:'dob'});
        namesValidatorStub = sandbox.stub().returns({item:'name'});
        identifierValidatorStub = sandbox.stub().returns({item:'id'});

        searchValidator = proxyquire('../../assets/javascripts/search/searchValidators', {
            '../../../data/dob': {
                'validate': dobValidatorStub
            },'../../../data/names': {
                'validate': namesValidatorStub
            },'../../../data/identifier': {
                'validate': identifierValidatorStub
            },
        });

    });

    afterEach(() => {
        sandbox.reset()
    });

    describe('isValidDob', () => {
        it('should call dob validate', () => {
            const $userInput = $('#dobContainer input');
            searchValidator.isValidDob($userInput);

            expect(dobValidatorStub).to.have.callCount(1)
        });

        it('should pass appropriate fields if dob is selected', () => {
            const $userInput = $('#dobContainer input');
            const expectedArgument = {
                dobOrAge: 'dob',
                dobDay: '',
                dobMonth: '',
                dobYear: ''
            };
            searchValidator.isValidDob($userInput);

            expect(dobValidatorStub).to.be.calledWith(expectedArgument)
        });

        it('should pass appropriate fields if age is selected', () => {
            $('#age').prop('checked', true);
            $('#optDob').prop('checked', false);

            const $userInput = $('#dobContainer input');
            const expectedArgument = {
                dobOrAge: 'age',
                age: ''
            };

            searchValidator.isValidDob($userInput);

            expect(dobValidatorStub).to.be.calledWith(expectedArgument)
        });

        it('should return the result', () => {
            const $userInput = $('#dobContainer input');
            const output = searchValidator.isValidDob($userInput);

            expect(output).to.eql({item:'dob'})

        });
    });

    describe('isValidName', () => {
        it('should call name validate', () => {
            const $userInput = $('#nameContainer input');
            searchValidator.isValidName($userInput);

            expect(namesValidatorStub).to.have.callCount(1)
        });

        it('should pass appropriate fields if name is selected', () => {
            const $userInput = $('#nameContainer input');
            const expectedArgument = {
                forename: '',
                forename2: '',
                surname: ''
            };
            searchValidator.isValidName($userInput);

            expect(namesValidatorStub).to.be.calledWith(expectedArgument)
        });

        it('should return the result', () => {
            const $userInput = $('#dobContainer input');
            const output = searchValidator.isValidName($userInput);

            expect(output).to.eql({item:'name'})

        });
    });

    describe('isValidisValidPrisonNumber', () => {
        it('should call prison number validate', () => {
            const $userInput = $('#prisonNumberContainer input');
            searchValidator.isValidPrisonNumber($userInput);

            expect(identifierValidatorStub).to.have.callCount(1)
        });

        it('should pass appropriate fields if identifier is selected', () => {
            const $userInput = $('#prisonNumberContainer input');
            const expectedArgument = {
                prisonNumber: '',
                pncNumber: '',
                croNumber: ''
            };
            searchValidator.isValidPrisonNumber($userInput);

            expect(identifierValidatorStub).to.be.calledWith(expectedArgument)
        });

        it('should return the result', () => {
            const $userInput = $('#prisonNumberContainer input');
            const output = searchValidator.isValidPrisonNumber($userInput);

            expect(output).to.eql({item:'id'})

        });
    });
});

