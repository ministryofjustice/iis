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

describe('searchController', () => {
    let callback;

    beforeEach(() => {
        callback = sandbox.spy();
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('healthcheck', () => {
        let getTupleStub = sandbox.stub().returns(null);

        const healthcheckProxy = (getTuple = getTupleStub) => {
            return proxyquire('../../server/healthcheck', {
                './db': {
                    'getTuple': getTuple
                }
            });
        };

        it('should return healthy if db resolves promise', () => {

            const expectedResult = {
                healthy: true,
                checks: {db: 'ok'}
            };

            const getTupleStub = sandbox.stub().callsArgWith(2, {});

            return healthcheckProxy(getTupleStub)(callback);
            expect(callback).to.have.callCount(1);
            expect(callback).to.be.calledWith(null, expectedResult);
        });

        it('should return unhealthy if db rejects promise', () => {
            const expectedResult = {
                healthy: false,
                checks: {db: 'problem'}
            };

            const getTupleStub = sandbox.stub().callsArgWith(3, 'problem');

            return healthcheckProxy(getTupleStub)(callback);
            expect(callback).to.have.callCount(1);
            expect(callback).to.be.calledWith(null, expectedResult);
        });
    });
});
