const {
    getIndex,
    postIndex,
    getSearchForm
} = require('../../controllers/searchController');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const content = require('../../data/content');
const proxyquire = require('proxyquire');
proxyquire.noCallThru();

describe('searchController', () => {
    let reqMock;
    let resMock;

    beforeEach(() => {
        reqMock = {};
        resMock = {render: sandbox.spy(), redirect: sandbox.spy()};
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getIndex', () => {
        it('should render the search page', () => {
            getIndex(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.have.been.calledWith('search', {content: content.view.search});
        });
    });

    describe('postIndex', () => {

        it('should redirect to the search page with the appropriate query string', () => {
            reqMock = {
                body: {
                    option: ['names', 'dob']
                }
            };

            const expectedUrl = '/search/form?0=names&1=dob';

            postIndex(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith(expectedUrl);
        });

        it('should render the search page with an error if no options selected', () => {
            reqMock = {
                body: {option: []},
                user: {id: 1}
            };

            const expectedError = {
                title: content.errMsg.CANNOT_SUBMIT,
                desc: content.errMsg.NO_OPTION_SELECTED
            };

            postIndex(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.have.been.calledWith('search', {err: expectedError,
                content: content.view.search});
        });
    });

    describe('getSearchForm', () => {
        it('should render the full search and pass in search items from query string', () => {
            reqMock = {
                query: {0: 'names', 1: 'dob'}
            };

            getSearchForm(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.have.been.calledWith('search/full-search', {
                content: {
                    body: 'Select all that apply',
                    title: 'What information do you have on the inmate?'
                },
                searchItems: ['names', 'dob'],
                hints: ['wildcard']
            });

        });

        it('should redirect to search if query contains unsupported search items', () => {
            reqMock = {
                query: {0: 'names', 1: 'dob', 2: 'bob'},
                params: {
                    view: 'view'
                }
            };

            getSearchForm(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith('/search');
        });
    });

    describe('postSearchForm', () => {
        let dobValidatorStub;
        let namesValidatorStub;
        let identifierValidatorStub;

        const postSearchFormProxy = (dobValidatorStub = sandbox.stub().returns(null),
                                     namesValidatorStub = sandbox.stub().returns(null),
                                     identifierValidatorStub = sandbox.stub().returns(null)) => {
            return proxyquire('../../controllers/searchController', {
                '../data/dob': {
                    'validate': dobValidatorStub
                }, '../data/names': {
                    'validate': namesValidatorStub
                }, '../data/identifier': {
                    'validate': identifierValidatorStub
                }
            }).postSearchForm;
        };

        it('should redirect to search results of no validation error returned', () => {
            reqMock = {
                body: {
                    forename: 'Matthew',
                    forename2: 'James',
                    surname: 'Whitfield',
                    prisonNumber: '',
                },
                query: {0: 'names', 1: 'identifier'},
                session: {}
            };

            postSearchFormProxy()(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith('/search/results');
        });

        it('should set the userInput on the session ', () => {
            reqMock = {
                body: {
                    forename: 'Matthew',
                    forename2: 'James',
                    surname: 'Whitfield',
                    prisonNumber: '666',
                },
                query: {0: 'names', 1: 'identifier'},
                session: {}
            };

            postSearchFormProxy()(reqMock, resMock);
            expect(reqMock.session.userInput).to.eql(reqMock.body);
        });

        it('should ignore items in query string that do not exist', () => {
            reqMock = {
                body: {
                    forename: 'Matthew',
                    forename2: 'James',
                    surname: 'Whitfield',
                    prisonNumber: '666',
                },
                query: {0: 'names', 1: 'identifier', 2: 'incorrect'},
                session: {}
            };

            postSearchFormProxy()(reqMock, resMock);
            expect(reqMock.session.userInput).to.eql(reqMock.body);
        });

        it('should redirect to search if any of the inputs do not validate', () => {
            dobValidatorStub = sandbox.stub().returns({error: 'error'});
            namesValidatorStub = sandbox.stub().returns({error: 'error'});
            identifierValidatorStub = sandbox.stub().returns(null);

            reqMock = {
                body: {
                    forename: 'Matthew',
                    forename2: 'James',
                    surname: 'Whitfield',
                    prisonNumber: '666',
                },
                query: {0: 'names'},
                session: {}
            };

            postSearchFormProxy(dobValidatorStub, namesValidatorStub, identifierValidatorStub)(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith('/search');
        });


    });
});
