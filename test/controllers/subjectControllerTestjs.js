const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const proxyquire = require('proxyquire');
proxyquire.noCallThru();

describe('searchController', () => {
    let reqMock;
    let resMock;

    beforeEach(() => {
        reqMock = {
            user: {
                email: 'x@y.com'
            },
            params: {
                id: 'id1'
            },
            session: {}
        };
        resMock = {render: sandbox.spy(), redirect: sandbox.spy(), status: sandbox.spy()};
    });

    afterEach(() => {
        sandbox.reset();
    });

    let infoStub = sandbox.stub().returns(null);
    let summaryStub = sandbox.stub().returns(null);
    let movementsStub = sandbox.stub().returns(null);
    let aliasesStub = sandbox.stub().returns(null);
    let addressesStub = sandbox.stub().returns(null);
    let offencesStub = sandbox.stub().returns(null);
    let hdcinfoStub = sandbox.stub().returns(null);
    let hdcrecallStub = sandbox.stub().returns(null);

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
                'info': info,
                'summary': summary,
                'movements': movements,
                'aliases': aliases,
                'addresses': addresses,
                'offences': offences,
                'hdcinfo': hdcinfo,
                'hdcrecall': hdcrecall

            }
        }).getSubject;
    };

    describe('getResults', () => {
        it('should assign the page visited to the session', () => {
            getSubject()(reqMock, resMock);
            expect(reqMock.session.visited).to.eql(['id1']);
        });

        it('should add the page visited to the session if some exist', () => {
            reqMock.session.visited = ['idexisting'];
            getSubject()(reqMock, resMock);
            expect(reqMock.session.visited).to.eql(['idexisting', 'id1']);
        });
    });
});
