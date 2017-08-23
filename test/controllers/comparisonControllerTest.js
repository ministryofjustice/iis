process.env.NODE_ENV = 'test';

const proxyquire = require('proxyquire');
proxyquire.noCallThru();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

describe('Comparison controller', function() {

    let reqMock;
    let resMock;
    let auditStub;

    const standardResponse = [{summary: {prisonNumber: 'AB111111'}}, {summary: {prisonNumber: 'AB111112'}}];
    const getSubjectsForComparisonStub = sinon.stub().returnsPromise().resolves(standardResponse);

    const comparisonControllerProxy = (getSubjectsForComparison = getSubjectsForComparisonStub) => {
        return proxyquire('../../controllers/comparisonController', {
            '../data/subject': {
                'getSubjectsForComparison': getSubjectsForComparison,
            },
            '../data/audit': {
                'record': auditStub
            }
        });
    };

    beforeEach(() => {
        auditStub = sandbox.spy();

        reqMock = {
            params: {
                prisonNumbers: 'AB111111,AB111112'
            },
            url: 'http://something.com/search',
            user: {email: 'x@y.com'}
        };
        resMock = {render: sandbox.spy(), redirect: sandbox.spy(), status: sandbox.spy()};
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getComparison', () => {
        it('should call getSubjectsForComparison', () => {
            comparisonControllerProxy().getComparison(reqMock, resMock);
            expect(getSubjectsForComparisonStub).to.have.callCount(1);
        });

        it('should pass an array of prisonNumbers to getSubjectsForComparison', () => {
            comparisonControllerProxy().getComparison(reqMock, resMock);
            const params = getSubjectsForComparisonStub.getCalls()[0].args[0];
            expect(params).to.be.eql(['AB111111', 'AB111112']);
        });

        it('should call res.render', () => {
            comparisonControllerProxy().getComparison(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
        });

        it('should pass the results of the query to the view', () => {
            comparisonControllerProxy().getComparison(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];

            expect(payload.subjects.summary).to.eql(standardResponse.summary);
        });

        it('should pass hrefs with each subject for removal', () => {
            reqMock.params.prisonNumbers = 'AB111111,AB111112,AB111113';
            const threeResponse = [
                {summary: {prisonNumber: 'AB111111'}},
                {summary: {prisonNumber: 'AB111112'}},
                {summary: {prisonNumber: 'AB111113'}}
            ];
            const get3SubjectsForComparisonStub = sinon.stub().returnsPromise().resolves(threeResponse);

            comparisonControllerProxy(get3SubjectsForComparisonStub).getComparison(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];
            expect(payload.subjects[0].removePath).to.eql('/comparison/AB111112,AB111113');
            expect(payload.subjects[1].removePath).to.eql('/comparison/AB111111,AB111113');
            expect(payload.subjects[2].removePath).to.eql('/comparison/AB111111,AB111112');
        });

        it('should pass the appropriate data to audit', () => {
            comparisonControllerProxy().getComparison(reqMock, resMock);
            expect(auditStub).to.be.calledWith('COMPARISON', 'x@y.com', ['AB111111','AB111112']);
        });
    });
});
