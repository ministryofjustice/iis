const {
    getIndex,
    postPagination,
    postFilters,
    postAddToShortlist
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
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

describe('searchController', () => {
    let reqMock;
    let resMock;

    beforeEach(() => {
        reqMock = {
            user: {
                email: 'x@y.com',
            },
            query: {},
            session: {},
            url: 'http://something.com/search'
        };
        resMock = {render: sandbox.spy(), redirect: sandbox.spy(), status: sandbox.spy()};
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getIndex', () => {
        it('should render the search page', () => {
            getIndex(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            const view = resMock.render.getCalls()[0].args[0];
            expect(view).to.eql('search/index');
        });

        it('should pass in error object if in query', () => {
            reqMock.query.error = 'ETIMEOUT';
            const expectedError = {
                title: 'The search timed out. Try a more specific query',
                desc: content.errMsg.DB_ERROR_DESC
            };

            getIndex(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            const payload = resMock.render.getCalls()[0].args[1];
            expect(payload.err).to.eql(expectedError);
        });

        it('should clear userinput', () => {
            reqMock.session.userInput = {some: 'thing'};
            const expectedUi= {};

            getIndex(reqMock, resMock);
            expect(reqMock.session.userInput).to.eql(expectedUi);
        });

        it('should tell the view to use placeholder', () => {
            getIndex(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];
            expect(payload.usePlaceholder).to.eql(true);
        });
    });

    describe('postSearchForm', () => {
        let validatorStub;

        beforeEach(() => {
            validatorStub = sandbox.stub().returns(null);
        });

        const postSearchFormProxy = (descriptionValidator = addressValidator = validatorStub) => {
            return proxyquire('../../controllers/searchController', {
                './helpers/formValidators': {
                    'validateDescriptionForm': descriptionValidator,
                    'validateAddressForm' : addressValidator
                }
            }).postSearchForm;
        };

        it('should redirect to search results if no validation error returned', () => {
            reqMock = {
                body: {
                    searchFormType: 'nameAge',
                    forename: 'Matthew',
                    surname: 'Whitfield'
                },
                session: {
                    userInput: {}
                },
                url: 'http://something.com/search'
            };

            postSearchFormProxy()(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith('/search/results');
        });

        it('should set the userInput on the session ', () => {
            reqMock = {
                body: {
                    searchFormType: 'nameAge',
                    forename: 'Matthew',
                    surname: 'Whitfield'
                },
                query: {0: 'names', 1: 'identifier'},
                session: {
                    userInput: {}
                },
                url: 'http://something.com/search'
            };

            postSearchFormProxy()(reqMock, resMock);
            expect(reqMock.session.userInput).to.eql({
                forename: 'Matthew',
                surname: 'Whitfield'
            });
        });

        it('should ignore items in query string that do not exist', () => {
            reqMock = {
                body: {
                    searchFormType: 'nameAge',
                    forename: 'Matthew',
                    surname: 'Whitfield'
                },
                query: {0: 'names', 1: 'identifier', 2: 'incorrect'},
                session: {
                    userInput: {}
                },
                url: 'http://something.com/search'
            };

            postSearchFormProxy()(reqMock, resMock);
            expect(reqMock.session.userInput).to.eql({
                forename: 'Matthew',
                surname: 'Whitfield'
            });
        });

        it('should only use the fields from the selected search type ', () => {
            reqMock = {
                body: {
                    searchFormType: 'other',
                    forename: 'Matthew',
                    surname: 'Whitfield',
                    address: 'address input'
                },
                query: {0: 'names', 1: 'identifier'},
                session: {
                    userInput: {}
                },
                url: 'http://something.com/search'
            };

            postSearchFormProxy()(reqMock, resMock);
            expect(reqMock.session.userInput).to.eql({address: 'address input'});
        });

        it('should render search with validation error if any of the inputs do not validate', () => {
            descriptionValidatorStub = sandbox.stub().returns({error: 'error'});

            reqMock = {
                body: {
                    searchFormType: 'nameAge',
                    forename: 'Matthew',
                    surname: 'Whitfield'
                },
                query: {0: 'names'},
                session: {
                    userInput: {}
                },
                url: 'http://something.com/search'
            };

            postSearchFormProxy(descriptionValidatorStub)(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            const view = resMock.render.getCalls()[0].args[0];
            const payload = resMock.render.getCalls()[0].args[1];
            expect(view).to.eql('search/index');
            expect(payload.err).to.eql({error: 'error'});
        });

        it('should reset the visited results', () => {
            reqMock = {
                body: {
                    searchFormType: 'nameAge',
                    forename: 'Matthew',
                    surname: 'Whitfield'
                },
                query: {0: 'names', 1: 'identifier', 2: 'incorrect'},
                session: {
                    visited: ['id1']
                }
            };

            postSearchFormProxy()(reqMock, resMock);
            expect(reqMock.session.visited).to.eql([]);
        });
    });

    describe('getResults', () => {

        let getRowsStub;
        let getInmatesStub;
        let auditStub;

        beforeEach(() => {
            getRowsStub = sandbox.stub().returnsPromise().resolves([{totalRows: {value: 20}}]);
            getInmatesStub = sandbox.stub().returnsPromise().resolves({forename: 'Matt'});
            auditStub = sandbox.spy();

            reqMock = {
                headers: {
                    referer: 'http://something.com/search/results?page=2'
                },
                session: {
                    userInput: {
                        forename: 'Matthew',
                        surname: 'Whitfield'
                    }
                },
                query: {page: 1},
                user: {email: 'x@y.com'},
                url: 'http://something.com/search/results?page=2&filters=Female',
                get: (item) => 'http://something.com/search/results?page=2'
            };
        });

        const getResultsProxy = (getSearchResultsCount = getRowsStub,
                                 getSearchResults = getInmatesStub) => {
            return proxyquire('../../controllers/searchController', {
                '../data/search': {
                    'getSearchResultsCount': getSearchResultsCount,
                    'getSearchResults': getSearchResults
                },
                '../data/audit': {
                    'record': auditStub
                }
            }).getResults;
        };

        it('should redirect to search if no referrer', () => {
            reqMock = {headers: {referer: undefined}};

            getResultsProxy()(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith('/search');
        });

        context('rowcounts === 0', () => {
            it('should not call getInmates', () => {
                getRowsStub = sinon.stub().returnsPromise().resolves([{totalRows: {value: 0}}]);
                getResultsProxy(getRowsStub)(reqMock, resMock);

                expect(getInmatesStub).to.have.callCount(0);
            });

            it('should render results page', () => {
                getRowsStub = sinon.stub().returnsPromise().resolves([{totalRows: {value: 0}}]);

                getResultsProxy(getRowsStub)(reqMock, resMock);
                expect(resMock.render).to.have.callCount(1);
            });

            it('should pass appropriate data to view', () => {
                getRowsStub = sinon.stub().returnsPromise().resolves([{totalRows: {value: 0}}]);
                getResultsProxy(getRowsStub)(reqMock, resMock);

                const expectedData = [];
                const expectedCount = 0;

                const payload = resMock.render.getCalls()[0].args[1];

                expect(payload.data).to.be.eql(expectedData);
                expect(payload.rowCount).to.be.eql(expectedCount);

            });

            it('should tell the view if id search', () => {
                reqMock.session.userInput = {prisonNumber: '666'};
                getResultsProxy(getRowsStub)(reqMock, resMock);
                const payload = resMock.render.getCalls()[0].args[1];
                expect(payload.idSearch).to.eql(true);
            });

        });

        context('rowcounts > 0', () => {

            it('should call getInmates', () => {
                getResultsProxy()(reqMock, resMock);
                expect(getInmatesStub).to.have.callCount(1);
            });

            it('should audit the search', () => {
                getResultsProxy()(reqMock, resMock);
                expect(auditStub).to.have.callCount(1);
            });

            it('should pass the appropriate data to audit', () => {
                getResultsProxy()(reqMock, resMock);
                expect(auditStub).to.be.calledWith('SEARCH', 'x@y.com', {
                    forename: 'Matthew',
                    page: 1,
                    surname: 'Whitfield'
                });
            });

            it('should redirectToReferer if the page is not valid', () => {
                reqMock.query.page = '20';
                getResultsProxy()(reqMock, resMock);

                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results?page=2&invalidPage=20');
            });

            it('should render results page', () => {
                getResultsProxy()(reqMock, resMock);
                expect(resMock.render).to.have.callCount(1);
            });

            it('should pass appropriate data to view', () => {
                getResultsProxy(getRowsStub)(reqMock, resMock);

                const expectedData = [{forename: 'Matt', shortListed: false, visited: false}];
                const expectedCount = 20;

                const payload = resMock.render.getCalls()[0].args[1];

                expect(payload.data).to.be.eql(expectedData);
                expect(payload.rowCount).to.be.eql(expectedCount);
            });

            it('should pass suggestions to view', () => {
                getResultsProxy(getRowsStub)(reqMock, resMock);

                const expectedSuggestions = {
                    forename: [{type: "useInitial", term: "forename", value: "M"}],
                        surname: [
                        {type: "addWildcard", term: "surname", value: "Whitfield%"},
                        {type: "addShorterWildcard", term: "surname", value: "Whitfie%"}],
                        firstLast: [
                        {type: "swap", term: "forename", value: "Whitfield"},
                        {type: "swap", term: "surname", value: "Matthew"}]
                };

                const payload = resMock.render.getCalls()[0].args[1];

                expect(payload.suggestions).to.be.eql(expectedSuggestions);
            });

            it('should pass form contents to view', () => {
                getResultsProxy(getRowsStub)(reqMock, resMock);

                const expectedFormContents = {
                    forename: "Matthew",
                    surname: "Whitfield"
                };

                const payload = resMock.render.getCalls()[0].args[1];

                expect(payload.formContents).to.be.eql(expectedFormContents);
            });

            it('should pass pagination details to view', () => {
                getResultsProxy(getRowsStub)(reqMock, resMock);

                const expectedPagination = {
                    'totalPages': 2,
                    'currPage': 1,
                    'showPrev': false,
                    'showNext': true
                };

                const payload = resMock.render.getCalls()[0].args[1];

                expect(payload.pagination).to.be.eql(expectedPagination);
            });

            it('should handle when no page passed in', () => {
                reqMock.url = 'http://something.com/search/results';

                const expectedPagination = {
                    'totalPages': 2,
                    'currPage': 1,
                    'showPrev': false,
                    'showNext': true
                };

                const expectedQueryStrings = {
                    prevPage: "?page=0",
                    thisPage: "",
                    nextPage: "?page=2"
                };

                getResultsProxy()(reqMock, resMock);

                const payload = resMock.render.getCalls()[0].args[1];
                expect(payload.pagination).to.be.eql(expectedPagination);
                expect(payload.queryStrings).to.be.eql(expectedQueryStrings);

            });

            it('should add visited data', () => {
                reqMock.session.visited = ['1', '3'];

                const receivedData = [
                    {prisonNumber: '1', forename: 'Matt'},
                    {prisonNumber: '2', forename: 'Alistair'},
                    {prisonNumber: '3', forename: 'Zed'},
                ];

                getInmatesStub = sandbox.stub().returnsPromise().resolves(receivedData);
                getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);

                const expectedData = [
                    {forename: 'Matt', prisonNumber: '1', visited: true, shortListed: false},
                    {forename: 'Alistair', prisonNumber: '2', visited: false, shortListed: false},
                    {forename: 'Zed', prisonNumber: '3', visited: true, shortListed: false}
                ];

                const payload = resMock.render.getCalls()[0].args[1];
                expect(payload.data).to.be.eql(expectedData);
            });

            it('should not add visited data when there are no results', () => {
                reqMock.session.visited = ['1', '3'];
                const receivedData = null;

                getInmatesStub = sandbox.stub().returnsPromise().resolves(receivedData);

                getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);

                const expectedData = [];

                const payload = resMock.render.getCalls()[0].args[1];
                expect(payload.data).to.be.eql(expectedData);
            });

            it('should pass a pageError if one is present', () => {
                reqMock.query.invalidPage = '20';
                getResultsProxy()(reqMock, resMock);

                const expectedPayloadError = {
                    title: 'Invalid selection',
                    desc: 'The page number 20 does not exist'
                };
                const payload = resMock.render.getCalls()[0].args[1];
                expect(payload.err).to.eql(expectedPayloadError);

            });

            context('Rejected getRows promise', () => {
                it('should redirect to search page', () => {
                    getRowsStub = sinon.stub().returnsPromise().rejects({code: 'ETIMEOUT'});
                    getResultsProxy(getRowsStub)(reqMock, resMock);

                    expect(resMock.redirect).to.have.callCount(1);
                    expect(resMock.redirect).to.have.been.calledWith('/search?error=ETIMEOUT');
                });
            });

            context('Rejected getInmates promise', () => {
                it('should redirect to search page', () => {
                    getInmatesStub = sinon.stub().returnsPromise().rejects({code: 'ETIMEOUT'});
                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);

                    expect(resMock.redirect).to.have.callCount(1);
                    expect(resMock.redirect).to.have.been.calledWith('/search?error=ETIMEOUT');
                });
            });

            it('should not pass the shortList to the view', () => {
                getResultsProxy()(reqMock, resMock);
                const payload = resMock.render.getCalls()[0].args[1];
                expect(payload.shortList).to.be.eql(null);
            });

            context('When shortList is in the query', () => {

                it('should pass the latest name into the view', () => {
                    reqMock.query.shortList = 'AB111111';
                    reqMock.query.shortListName = 'Matthew Whitfield';
                    const expectedShortListName = 'Matthew Whitfield';

                    getResultsProxy()(reqMock, resMock);
                    const payload = resMock.render.getCalls()[0].args[1];
                    expect(payload.shortList.latestName).to.be.eql(expectedShortListName);
                });

                it('should pass the shortList to the view in an array', () => {
                    reqMock.query.shortList = 'AB111111';
                    const expectedShortList = ['AB111111'];

                    getResultsProxy()(reqMock, resMock);
                    const payload = resMock.render.getCalls()[0].args[1];
                    expect(payload.shortList.prisonNumbers).to.be.eql(expectedShortList);

                });

                it('should pass the shortList to the view in an array if already multiple', () => {
                    reqMock.query.shortList = ['AB111111', 'AB111112'];
                    const expectedShortList = ['AB111111', 'AB111112'];

                    getResultsProxy()(reqMock, resMock);
                    const payload = resMock.render.getCalls()[0].args[1];
                    expect(payload.shortList.prisonNumbers).to.be.eql(expectedShortList);

                });

                it('should pass the href of the comparison page', () => {
                    reqMock.query.shortList = ['AB111111', 'AB111112'];
                    getResultsProxy()(reqMock, resMock);

                    const payload = resMock.render.getCalls()[0].args[1];
                    expect(payload.shortList.href).to.be.eql('/comparison/AB111111,AB111112');
                });

                it('should attach shortlist information to results', () => {
                    reqMock.query.shortList = ['AB111111', 'AB111112'];

                    const receivedData = [
                        {prisonNumber: 'AB111111', forename: 'Matt'},
                        {prisonNumber: 'AB111112', forename: 'Alistair'},
                        {prisonNumber: 'AB111113', forename: 'Zed'},
                    ];

                    getInmatesStub = sandbox.stub().returnsPromise().resolves(receivedData);
                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);

                    const expectedData = [
                        {forename: 'Matt', prisonNumber: 'AB111111', shortListed: true, visited: false},
                        {forename: 'Alistair', prisonNumber: 'AB111112', shortListed: true, visited: false},
                        {forename: 'Zed', prisonNumber: 'AB111113', shortListed: false, visited: false}
                    ];

                    const payload = resMock.render.getCalls()[0].args[1];
                    expect(payload.data).to.be.eql(expectedData);
                });
            });

            context('When filters are in the query', () => {

                it('should make sure no filters in userinput if none in query string', () => {
                    reqMock.session.userInput.gender = ['F'];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        surname: 'Whitfield',
                        page: 1,
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should add the filters to the user input in an array', () => {
                    reqMock.query.filters = 'Female';

                    const expectedUserInput = {
                        forename: 'Matthew',
                        surname: 'Whitfield',
                        page: 1,
                        gender: ['F']
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should be able to handle multiple genders', () => {
                    reqMock.query.filters = ['Female', 'Male'];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        surname: 'Whitfield',
                        page: 1,
                        gender: ['F', 'M']
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should be able to handle HDC', () => {
                    reqMock.query.filters = ['HDC'];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        surname: 'Whitfield',
                        page: 1,
                        hasHDC: [true]
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should be able to handle Lifer', () => {
                    reqMock.query.filters = ['Lifer'];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        surname: 'Whitfield',
                        page: 1,
                        isLifer: [true]
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should replace the filters to the user input', () => {
                    reqMock.query.filters = 'Male';
                    reqMock.session.userInput.gender = ['F'];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        surname: 'Whitfield',
                        page: 1,
                        gender: ['M']
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should remove any gender that is not in query', () => {
                    reqMock.query.filters = 'Female';
                    reqMock.session.userInput.gender = ['F', 'M'];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        surname: 'Whitfield',
                        page: 1,
                        gender: ['F']
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should remove any other filter that is not in query', () => {
                    reqMock.query.filters = 'HDC';
                    reqMock.session.userInput.gender = ['F'];
                    reqMock.session.userInput.hasHDC = [true];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        surname: 'Whitfield',
                        page: 1,
                        hasHDC: [true]
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should send appropriate data to view', () => {
                    reqMock.query.filters = ['Female', 'HDC'];
                    getResultsProxy()(reqMock, resMock);

                    const expectedFilters = {Female: true, HDC: true};

                    const payload = resMock.render.getCalls()[0].args[1];
                    expect(payload.filtersForView).to.eql(expectedFilters);
                });
            });
        });

        describe('postPagination', () => {
            it('should redirect to appropriate page', () => {
                reqMock = {
                    body: {
                        pageNumber: '8'
                    }
                };
                postPagination(reqMock, resMock);
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results?page=8');

            });

            it('should not alter the rest of the query string', () => {
                reqMock = {
                    body: {
                        pageNumber: '8'
                    },
                    query: {
                        filters: 'HDC'
                    }
                };
                postPagination(reqMock, resMock);
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results?filters=HDC&page=8');
            });
        });

        describe('postFilters', () => {
            it('should redirect to first results page appending the filter', () => {
                reqMock = {
                    body: {
                        pageNumber: '8',
                        filter: 'Male'
                    },
                    get: (item) => 'http://something.com/search/results'
                };
                postFilters(reqMock, resMock);
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results?filters=Male&page=1');

            });

            it('should remove the filter if it was already on referrer', () => {
                reqMock = {
                    body: {
                        pageNumber: '8',
                        filter: 'Male'
                    },
                    get: (item) => 'http://something.com/search/results?filters=Male'
                };
                postFilters(reqMock, resMock);
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results?page=1');
            });

            it('should be able to add more than one filter', () => {
                reqMock = {
                    body: {
                        pageNumber: '8',
                        filter: 'Female'
                    },
                    get: (item) => 'http://something.com/search/results?filters=Male'
                };
                postFilters(reqMock, resMock);
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results?filters=Male&filters=Female&page=1');
            });
        });

        describe('postAddToShortlist', () => {
            it('should redirect to first same page appending the short list ', () => {
                reqMock = {
                    body: {
                        pageNumber: '8',
                        addToShortListName: 'Matthew Whitfield',
                        addToShortList: 'Male'
                    },
                    get: (item) => 'http://something.com/search/results'
                };
                postAddToShortlist(reqMock, resMock);
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results?shortList=Male&shortListName=Matthew%20Whitfield');

            });

            it('should remove the filter if it was already on referrer', () => {
                reqMock = {
                    body: {
                        pageNumber: '8',
                        addToShortList: 'Male'
                    },
                    get: (item) => 'http://something.com/search/results?shortList=Male'
                };
                postAddToShortlist(reqMock, resMock);
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results');
            });

            it('should be able to add more than one filter', () => {
                reqMock = {
                    body: {
                        pageNumber: '8',
                        addToShortList: 'Female'
                    },
                    get: (item) => 'http://something.com/search/results?shortList=Male'
                };
                postAddToShortlist(reqMock, resMock);
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results?shortList=Male&shortList=Female');
            });
        });
    });
});
