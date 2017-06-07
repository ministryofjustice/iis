const {
    getIndex,
    postIndex,
    getSearchForm,
    postPagination,
    postFilters
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
        reqMock = {user: {
            email: 'x@y.com'
        }};
        resMock = {render: sandbox.spy(), redirect: sandbox.spy(), status: sandbox.spy()};
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
                    prisonNumber: ''
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
                    prisonNumber: '666'
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
                    prisonNumber: '666'
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
                    prisonNumber: '666'
                },
                query: {0: 'names'},
                session: {}
            };

            postSearchFormProxy(dobValidatorStub, namesValidatorStub, identifierValidatorStub)(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith('/search');
        });

        it('should reset the visited results', () => {
            reqMock = {
                body: {
                    forename: 'Matthew',
                    forename2: 'James',
                    surname: 'Whitfield',
                    prisonNumber: '666'
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
            getRowsStub = sandbox.stub().returnsPromise().resolves({totalRows: {value: 20}});
            getInmatesStub = sandbox.stub().returnsPromise().resolves({forename: 'Matt'});
            auditStub = sandbox.spy();

            reqMock = {
                headers: {
                    referer: 'http://something.com/search/results?page=2'
                },
                session: {
                    userInput: {
                        forename: 'Matthew',
                        forename2: 'James',
                        surname: 'Whitfield',
                        prisonNumber: '666'
                    }
                },
                query: {page: 1},
                user: {email: 'x@y.com'},
                params: {v: 'not sure what this is for'},
                get: (item) => 'http://something.com/search/results?page=2'
            };
        });

        const getResultsProxy = (getRows = getRowsStub,
                                 getInmates = getInmatesStub) => {
            return proxyquire('../../controllers/searchController', {
                '../data/search': {
                    'totalRowsForUserInput': getRows,
                    'inmate': getInmates
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

        it('should set session.lastPage as current pagination position', () => {
            getResultsProxy()(reqMock, resMock);
            expect(reqMock.session.lastPage).to.eql(1);
        });

        context('rowcounts = 0', () => {
            it('should not call getInmates', () => {
                getRowsStub = sinon.stub().returnsPromise().resolves({totalRows: {value: 0}});
                getResultsProxy(getRowsStub)(reqMock, resMock);

                expect(getInmatesStub).to.have.callCount(0);
            });

            it('should render results page', () => {
                getRowsStub = sinon.stub().returnsPromise().resolves({totalRows: {value: 0}});

                getResultsProxy(getRowsStub)(reqMock, resMock);
                expect(resMock.render).to.have.callCount(1);
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
                expect(auditStub).to.be.calledWith('SEARCH', 'x@y.com', {forename: 'Matthew',
                                                                         forename2: 'James',
                                                                         page: 1,
                                                                         prisonNumber: '666',
                                                                         surname: 'Whitfield'});
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
                getResultsProxy()(reqMock, resMock);

                const expectedPayload = {
                    content: {
                        title: 'Your search returned 20 results'
                    },
                    view: 'not sure what this is for',
                    pagination: {
                        'totalPages': 2,
                        'currPage': 1,
                        'showPrev': false,
                        'showNext': true
                    },
                    data: {forename: 'Matt'},
                    err: null,
                    filtersForView: {}
                };

                expect(resMock.render).to.be.calledWith('search/results', expectedPayload);
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

                const expectedPayload = {
                    content: {
                        title: 'Your search returned 20 results'
                    },
                    view: 'not sure what this is for',
                    pagination: {
                        'totalPages': 2,
                        'currPage': 1,
                        'showPrev': false,
                        'showNext': true
                    },
                    data: [
                        {forename: 'Matt', prisonNumber: '1', visited: true},
                        {forename: 'Alistair', prisonNumber: '2', visited: false},
                        {forename: 'Zed', prisonNumber: '3', visited: true}
                    ],
                    err: null,
                    filtersForView: {}
                };

                expect(resMock.render).to.be.calledWith('search/results', expectedPayload);
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
                    getRowsStub = sinon.stub().returnsPromise().rejects('rejection');
                    getResultsProxy(getRowsStub)(reqMock, resMock);

                    expect(resMock.render).to.have.callCount(1);
                    expect(resMock.render).to.have.been.calledWith('search');
                });
            });

            context('Rejected getInmates promise', () => {
                it('should redirect to search page', () => {
                    getInmatesStub = sinon.stub().returnsPromise().rejects('rejection');
                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);

                    expect(resMock.render).to.have.callCount(1);
                    expect(resMock.render).to.have.been.calledWith('search');
                });
            });

            context('When filters are in the query', () => {

                it('should make sure no filters in userinput if none in query string', () => {
                    reqMock.session.userInput.gender = ['F'];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        forename2: 'James',
                        surname: 'Whitfield',
                        prisonNumber: '666',
                        page: 1,
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should add the filters to the user input in an array', () => {
                    reqMock.query.filters = 'Female';

                    const expectedUserInput = {
                        forename: 'Matthew',
                        forename2: 'James',
                        surname: 'Whitfield',
                        prisonNumber: '666',
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
                        forename2: 'James',
                        surname: 'Whitfield',
                        prisonNumber: '666',
                        page: 1,
                        gender: ['F', 'M']
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });


                it('should replace the filters to the user input', () => {
                    reqMock.query.filters = 'Male';
                    reqMock.session.userInput.gender = ['F'];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        forename2: 'James',
                        surname: 'Whitfield',
                        prisonNumber: '666',
                        page: 1,
                        gender: ['M']
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should remove any that are not in query', () => {
                    reqMock.query.filters = 'Female';
                    reqMock.session.userInput.gender = ['F', 'M'];

                    const expectedUserInput = {
                        forename: 'Matthew',
                        forename2: 'James',
                        surname: 'Whitfield',
                        prisonNumber: '666',
                        page: 1,
                        gender: ['F']
                    };

                    getResultsProxy(getRowsStub, getInmatesStub)(reqMock, resMock);
                    expect(reqMock.session.userInput).to.eql(expectedUserInput);
                });

                it('should send appropriate data to view', () => {
                    reqMock.query.filters = 'Female';
                    getResultsProxy()(reqMock, resMock);

                    const expectedPayload = {
                        content: {
                            title: 'Your search returned 20 results'
                        },
                        view: 'not sure what this is for',
                        pagination: {
                            'totalPages': 2,
                            'currPage': 1,
                            'showPrev': false,
                            'showNext': true
                        },
                        data: {forename: 'Matt'},
                        err: null,
                        filtersForView: {Female: true}
                    };

                    expect(resMock.render).to.be.calledWith('search/results', expectedPayload);

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
        });

        describe('postFilters', () => {
            it('should redirect to search page appending the filter', () => {
                reqMock = {
                    body: {
                        pageNumber: '8',
                        filter: 'Male'
                    },
                    get: (item) => 'http://something.com/search/results'
                };
                postFilters(reqMock, resMock);
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/search/results?filters=Male');

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
                expect(resMock.redirect).to.have.been.calledWith('/search/results');
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
                expect(resMock.redirect).to.have.been.calledWith('/search/results?filters=Male&filters=Female');
            });
        });
    });
});
