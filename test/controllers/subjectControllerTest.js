const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

describe('subjectController', () => {
    let reqMock;
    let resMock;
    let subjectStub;
    let movementsStub;
    let aliasesStub;
    let addressesStub;
    let offencesStub;
    let hdcinfoStub;
    let hdcrecallStub;
    let auditSpy;

    beforeEach(() => {
        reqMock = {
            user: {email: 'x@y.com'},
            params: {id: 'id1', page: 'aliases'},
            session: {},
            url: 'http://something.com/search/results?page=2&filters=Female'
        };
        resMock = {render: sandbox.spy(), redirect: sandbox.spy(), status: sandbox.spy()};

        subjectStub = sandbox.stub().returnsPromise().resolves({
            prisonNumber: '     id1',
            personIdentifier: '1',
            dob: '1'
        });
        movementsStub = sandbox.stub().returns(null);
        aliasesStub = sandbox.stub().returnsPromise().resolves({dob: '1'});
        addressesStub = sandbox.stub().returns(null);
        offencesStub = sandbox.stub().returnsPromise().resolves({dob: '1'});
        hdcinfoStub = sandbox.stub().returnsPromise().resolves();
        hdcrecallStub = sandbox.stub().returns(null);
        auditSpy = sandbox.spy();
    });

    afterEach(() => {
        sandbox.reset();
    });

    const getSubject = ({
                            subject = subjectStub,
                            movements = movementsStub,
                            aliases = aliasesStub,
                            addresses = addressesStub,
                            offences = offencesStub,
                            hdcinfo = hdcinfoStub,
                            hdcrecall = hdcrecallStub
                        } = {}) => {
        return proxyquire('../../controllers/subjectController', {
            '../data/subject': {
                'getSubject': subject,
                'getMovements': movements,
                'getAliases': aliases,
                'getAddresses': addresses,
                'getOffences': offences,
                'getHDCInfo': hdcinfo,
                'getHDCRecall': hdcrecall

            },
            '../data/audit': {
                'record': auditSpy
            }
        }).getSubject;
    };

    describe('getSubject', () => {
        it('should assign the page visited to the session', () => {
            getSubject()(reqMock, resMock);
            expect(reqMock.session.visited).to.eql(['id1']);
        });

        it('should add the page visited to the session if some exist', () => {
            reqMock.session.visited = ['idexisting'];
            getSubject()(reqMock, resMock);
            expect(reqMock.session.visited).to.eql(['idexisting', 'id1']);
        });

        it('should audit that the page has been viewed', () => {
            getSubject()(reqMock, resMock);
            expect(auditSpy).to.have.callCount(1);
            expect(auditSpy).to.be.calledWith('VIEW', 'x@y.com', {page: 'aliases', prisonNumber: '     id1'});
        });

        it('should call getSummary and pass in prison number', () => {
            getSubject()(reqMock, resMock);
            expect(subjectStub).to.have.callCount(1);
            expect(subjectStub).to.be.calledWith('     id1');
        });

        it('should get data for the appropriate page', () => {
            getSubject()(reqMock, resMock);
            expect(aliasesStub).to.have.callCount(1);
            expect(aliasesStub).to.be.calledWith('     id1');
        });

        it('should get data for the appropriate page if not summary', () => {
            reqMock.params.page = 'hdcinfo';
            getSubject()(reqMock, resMock);
            expect(hdcinfoStub).to.have.callCount(1);
            expect(hdcinfoStub).to.be.calledWith('     id1');
            expect(hdcrecallStub).to.have.callCount(1);
            expect(hdcrecallStub).to.be.calledWith('     id1');
        });

        it('should render the appropriate subject page', () => {
            return getSubject()(reqMock, resMock).then(() => {
                expect(resMock.render).to.have.callCount(1);
                expect(resMock.render).to.be.calledWith('subject/aliases');
            })
        });

        it('should render the appropriate subject page if not summary', () => {
            reqMock.params.page = 'offences';
            return getSubject()(reqMock, resMock).then(() => {
                expect(resMock.render).to.have.callCount(1);
                expect(resMock.render).to.be.calledWith('subject/offences');
            });
        });

        it('should send appropriate data to page', () => {
            reqMock.params.page = 'offences';
            return getSubject()(reqMock, resMock).then(() => {
                expect(resMock.render).to.be.calledWith('subject/offences', {
                    content: {
                        addresses: "Prisoner has no addresses",
                        aliases: "Prisoner has no aliases",
                        hdcinfo: "Prisoner has no HDC information",
                        hdcrecall: "Prisoner has no HDC recall history",
                        movements: "Prisoner has no movements",
                        offences: "Prisoner has no offences",
                        offencesincustody: "Prisoner has no offences in custody",
                        sentences: "Prisoner has no sentence history",
                        title: "Prisoner details"
                    },
                    data: {
                        details: {dob: "1"},
                        noResultsText: "Prisoner has no offences",
                        subject: {dob: "1", personIdentifier: "1", prisonNumber: "     id1"}
                    },
                    nav: {
                        addresses: {title: "Addresses"},
                        aliases: {title: "Aliases"},
                        hdcinfo: {title: "HDC recalls and history"},
                        movements: {title: "Movements"},
                        offences: {active: true, title: "Offences"},
                        offencesincustody: {title: "Offences in custody"},
                        sentences: {title: "Sentence history"},
                        summary: {title: "Sentence summary"}
                    },
                    returnQuery: "?page=2&filters=Female"
                });
            });
        });

        context('Promise rejection', () => {
            it('should render error page if getSummary rejects', () => {
                subjectStub = sandbox.stub().returnsPromise().rejects('error');
                getSubject({summary: subjectStub})(reqMock, resMock);

                expect(resMock.render).to.have.callCount(1);
                expect(resMock.render).to.be.calledWith('subject/error');
            });

            it('should render error page if get[page] rejects', () => {
                subjectStub = sandbox.stub().returnsPromise().rejects('error');
                getSubject({summary: subjectStub})(reqMock, resMock);

                expect(resMock.render).to.have.callCount(1);
                expect(resMock.render).to.be.calledWith('subject/error');
            });
        });
    });

});
