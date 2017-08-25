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
            user: {email: 'x@y.com'},
            query: {filter: 'M', shortList: 'AB111111', shortListName: 'Matt'}
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

        it('should pass the return path with short list items removed', () => {
            comparisonControllerProxy().getComparison(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];

            expect(payload.returnClearShortListQuery).to.eql('/search/results?filter=M');
        });

        it('should pass the return path with short list items removed if already none in query', () => {
            reqMock.query = {filter: 'F'};
            comparisonControllerProxy().getComparison(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];

            expect(payload.returnClearShortListQuery).to.eql('/search/results?filter=F');
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

        it('should not showAliases if none of the results contain aliases', () => {
            comparisonControllerProxy().getComparison(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];

            expect(payload.showAliases).to.eql(false);
        });

        it('should showAliases if any of the results contain aliases', () => {
            const aliasResponse = [
                {summary: {prisonNumber: 'AB111111'}},
                {summary: {prisonNumber: 'AB111112'}, aliases: ['a']}
            ];
            const aliasStub = sinon.stub().returnsPromise().resolves(aliasResponse);

            comparisonControllerProxy(aliasStub).getComparison(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];

            expect(payload.showAliases).to.eql(true);
        });

        it('should not showAddresses if none of the results contain addresses', () => {
            comparisonControllerProxy().getComparison(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];

            expect(payload.showAddresses).to.eql(false);
        });

        it('should showAddresses if any of the results contain addresses', () => {
            const addressResponse = [
                {summary: {prisonNumber: 'AB111111'}, addresses: ['a']},
                {summary: {prisonNumber: 'AB111112'}, addresses: ['a']}
            ];
            const addressStub = sinon.stub().returnsPromise().resolves(addressResponse);

            comparisonControllerProxy(addressStub).getComparison(reqMock, resMock);
            const payload = resMock.render.getCalls()[0].args[1];

            expect(payload.showAddresses).to.eql(true);
        });
    });
});
