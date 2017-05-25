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
    let infoStub;
    let summaryStub;
    let movementsStub;
    let aliasesStub;
    let addressesStub;
    let offencesStub;
    let hdcinfoStub;
    let hdcrecallStub;

    beforeEach(() => {
        reqMock = {
            user: {email: 'x@y.com'},
            params: {id: 'id1', page: 'summary'},
            session: {}
        };
        resMock = {render: sandbox.spy(), redirect: sandbox.spy(), status: sandbox.spy()};

        infoStub = sandbox.stub().returnsPromise().resolves({personIdentifier: '1'});
        summaryStub = sandbox.stub().returnsPromise().resolves({dob: '1'});
        movementsStub = sandbox.stub().returns(null);
        aliasesStub = sandbox.stub().returns(null);
        addressesStub = sandbox.stub().returns(null);
        offencesStub = sandbox.stub().returnsPromise().resolves({dob: '1'});
        hdcinfoStub = sandbox.stub().returnsPromise().resolves();
        hdcrecallStub = sandbox.stub().returns(null);
    });

    afterEach(() => {
        sandbox.reset();
    });

    const getSubject = ({info = infoStub,
                         summary = summaryStub,
                         movements = movementsStub,
                         aliases = aliasesStub,
                         addresses = addressesStub,
                         offences = offencesStub,
                         hdcinfo = hdcinfoStub,
                         hdcrecall = hdcrecallStub} = {}) => {
        return proxyquire('../../controllers/subjectController', {
            '../data/subject': {
                'getInfo': info,
                'getSummary': summary,
                'getMovements': movements,
                'getAliases': aliases,
                'getAddresses': addresses,
                'getOffences': offences,
                'getHDCInfo': hdcinfo,
                'getHDCRecall': hdcrecall

            }
        }).getSubject;
    };

    describe ('getSubject', () => {
        it('should assign the page visited to the session', () => {
            getSubject()(reqMock, resMock);
            expect(reqMock.session.visited).to.eql(['id1']);
        });

        it('should add the page visited to the session if some exist', () => {
            reqMock.session.visited = ['idexisting'];
            getSubject()(reqMock, resMock);
            expect(reqMock.session.visited).to.eql(['idexisting', 'id1']);
        });

        it('should call getInfo and pass in prison number', () => {
            getSubject()(reqMock, resMock);
            expect(infoStub).to.have.callCount(1);
            expect(infoStub).to.be.calledWith('     id1');
        });

        it('should get data for the appropriate page', () => {
            getSubject()(reqMock, resMock);
            expect(summaryStub).to.have.callCount(1);
            expect(summaryStub).to.be.calledWith({
                prisonNumber: '     id1',
                personIdentifier: '1'
            });
        });

        it('should get data for the appropriate page if not summary', () => {
            reqMock.params.page = 'hdcinfo';
            getSubject()(reqMock, resMock);
            expect(hdcinfoStub).to.have.callCount(1);
            expect(hdcinfoStub).to.be.calledWith({
                prisonNumber: '     id1',
                personIdentifier: '1'
            });
        });

        it('should render the appropriate subject page', () => {
            getSubject()(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.be.calledWith('subject/summary');
        });

        it('should render the appropriate subject page if not summary', () => {
            reqMock.params.page = 'offences';
            getSubject()(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.be.calledWith('subject/offences');
        });

        it('should send appropriate data to page', () => {
            reqMock.params.page = 'offences';
            getSubject()(reqMock, resMock);
            expect(resMock.render).to.be.calledWith('subject/offences', {
                data: {
                    subject: {personIdentifier: '1'},
                    details: {dob: '1', age: 0},
                    noResultsText: 'Subject has no offences'
                },
                content: {
                    'title': 'Subject details',
                    'aliases': 'Subject has no aliases',
                    'movements': 'Subject has no movements',
                    'hdcinfo': 'Subject has no HDC history',
                    'hdcrecall': 'Subject has no HDC recall history',
                    'offences': 'Subject has no offences',
                    'addresses': 'Subject has no addresses',
                    'adjudications': 'Subject has no adjudications',

                },
                lastPageNum: 1,
                nav: {
                    addresses: {title: 'Addresses'},
                    aliases: {title: 'Aliases'},
                    hdcinfo: {title: 'HDC history'},
                    movements: {title: 'Movements'},
                    offences: {active: true, title: 'Offences'},
                    summary: {title: 'Summary'},
                    adjudications: { title: "Adjudications" },
                }
            });
        });

        context('Promise rejection', () => {
            it('should render error page if getInfo rejects', () => {
                infoStub = sandbox.stub().returnsPromise().rejects('error');
                getSubject({info: infoStub})(reqMock, resMock);

                expect(resMock.render).to.have.callCount(1);
                expect(resMock.render).to.be.calledWith('subject/error');
            });

            it('should render error page if get[page] rejects', () => {
                summaryStub = sandbox.stub().returnsPromise().rejects('error');
                getSubject({summary: summaryStub})(reqMock, resMock);

                expect(resMock.render).to.have.callCount(1);
                expect(resMock.render).to.be.calledWith('subject/error');
            });
        });
    });

});
