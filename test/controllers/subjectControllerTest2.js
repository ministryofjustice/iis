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

describe('subjectController2', () => {
    let reqMock;
    let resMock;
    let subjectStub;
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
        auditSpy = sandbox.spy();
    });

    afterEach(() => {
        sandbox.reset();
    });

    const getSubject = ({subject = subjectStub} = {}) => {
        return proxyquire('../../controllers/subjectController2', {
            '../data/subject2': {
                'getSubject': subject,
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

        describe('data requested', () => {
            it('should get data for the appropriate page if aliases', () => {
                getSubject()(reqMock, resMock);
                expect(subjectStub).to.have.callCount(1);
                expect(subjectStub).to.be.calledWith('     id1', ['aliases']);
            });

            it('should get data for the appropriate page if hdcinfo', () => {
                reqMock.params.page = 'hdcinfo';
                getSubject()(reqMock, resMock);
                expect(subjectStub).to.have.callCount(1);
                expect(subjectStub).to.be.calledWith('     id1', ['hdcRecall', 'hdcInfo']);
            });

            it('should get data for the appropriate page if movements', () => {
                reqMock.params.page = 'movements';
                getSubject()(reqMock, resMock);
                expect(subjectStub).to.have.callCount(1);
                expect(subjectStub).to.be.calledWith('     id1', ['movements']);
            });

            it('should get data for the appropriate page if addresses', () => {
                reqMock.params.page = 'addresses';
                getSubject()(reqMock, resMock);
                expect(subjectStub).to.have.callCount(1);
                expect(subjectStub).to.be.calledWith('     id1', ['addresses']);
            });

            it('should get data for the appropriate page if offences', () => {
                reqMock.params.page = 'offences';
                getSubject()(reqMock, resMock);
                expect(subjectStub).to.have.callCount(1);
                expect(subjectStub).to.be.calledWith('     id1', ['offences']);
            });

            it('should get data for the appropriate page if offencesInCustody', () => {
                reqMock.params.page = 'offencesincustody';
                getSubject()(reqMock, resMock);
                expect(subjectStub).to.have.callCount(1);
                expect(subjectStub).to.be.calledWith('     id1', ['offencesInCustody']);
            });

            it('should get data for the appropriate page if summary', () => {
                reqMock.params.page = 'summary';
                getSubject()(reqMock, resMock);
                expect(subjectStub).to.have.callCount(1);
                expect(subjectStub).to.be.calledWith('     id1', ['courtHearings', 'sentencing']);
            });
        });

        it('should render the appropriate subject page', () => {
            return getSubject()(reqMock, resMock).then(() => {
                expect(resMock.render).to.have.callCount(1);
                expect(resMock.render.getCall(0).args[0]).to.eql('subject2/aliases');
            });
        });

        it('should render the appropriate subject page if not summary', () => {
            reqMock.params.page = 'offences';
            return getSubject()(reqMock, resMock).then(() => {
                expect(resMock.render).to.have.callCount(1);
                expect(resMock.render.getCall(0).args[0]).to.eql('subject2/offences');
            });
        });

        describe('page data', () => {
            it('should send appropriate subject data to page', () => {
                reqMock.params.page = 'offences';
                return getSubject()(reqMock, resMock).then(() => {
                    expect(resMock.render.getCall(0).args[0]).to.eql('subject2/offences');
                    expect(resMock.render.getCall(0).args[1].subject).to.eql({dob: "1", personIdentifier: "1", prisonNumber: "     id1"});
                });
            });

            it('should send return query to page', () => {
                reqMock.params.page = 'offences';
                return getSubject()(reqMock, resMock).then(() => {
                    expect(resMock.render.getCall(0).args[1].returnQuery).to.eql("?page=2&filters=Female");
                });
            });

            it('should send no results text to page', () => {
                reqMock.params.page = 'offences';
                return getSubject()(reqMock, resMock).then(() => {
                    expect(resMock.render.getCall(0).args[1].noResultsText).to.eql("Prisoner has no offences");
                });
            });

            it('should send no results text to page', () => {
                reqMock.params.page = 'offences';
                return getSubject()(reqMock, resMock).then(() => {
                    expect(resMock.render.getCall(0).args[1].noResultsText).to.eql("Prisoner has no offences");
                });
            });

            it('should send content to page', () => {
                reqMock.params.page = 'offences';
                return getSubject()(reqMock, resMock).then(() => {
                    expect(resMock.render.getCall(0).args[1].content).to.eql({
                        title: 'Prisoner details',
                        aliases: 'Prisoner has no aliases',
                        offencesincustody: 'Prisoner has no offences in custody',
                        movements: 'Prisoner has no movements',
                        hdcinfo: 'Prisoner has no HDC information',
                        hdcrecall: 'Prisoner has no HDC recall history',
                        offences: 'Prisoner has no offences',
                        addresses: 'Prisoner has no addresses',
                        sentences: 'Prisoner has no sentence history'
                    });
                });
            });

            it('should send nav content to page', () => {
                reqMock.params.page = 'offences';
                return getSubject()(reqMock, resMock).then(() => {
                    expect(resMock.render.getCall(0).args[1].nav).to.eql({
                        summary: {title: 'Sentence summary'},
                        sentences: {title: 'Sentence history'},
                        movements: {title: 'Movements'},
                        hdcinfo: {title: 'HDC recalls and history'},
                        offences: {title: 'Offences', active: true},
                        offencesincustody: {title: 'Offences in custody'},
                        aliases: {title: 'Aliases'},
                        addresses: {title: 'Addresses'}
                    });
                });
            });

            it('should send moment and case to page', () => {
                reqMock.params.page = 'offences';
                return getSubject()(reqMock, resMock).then(() => {
                    expect(resMock.render.getCall(0).args[1].moment).to.eql(require('moment'));
                    expect(resMock.render.getCall(0).args[1].setCase).to.eql({
                        sentence: require('../../controllers/helpers/textHelpers').sentence,
                        capital: require('../../controllers/helpers/textHelpers').capital,
                        capitalWithAcronyms: require('../../controllers/helpers/textHelpers').capitalWithAcronyms,
                        sentenceWithAcronyms: require('../../controllers/helpers/textHelpers').sentenceWithAcronyms
                    });
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
