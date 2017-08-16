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
        const dbCheckStub = sinon.stub().returnsPromise().resolves([{totalRows: {value: 0}}]);

        const healthcheckProxy = (dbCheck = dbCheckStub) => {
            return proxyquire('../../server/healthcheck', {
                '../data/healthcheck': {
                    'dbCheck': dbCheck
                }
            });
        };

        it('should return healthy if db resolves promise', () => {

            return healthcheckProxy()(callback).then(() => {

                const calledWith = callback.getCalls()[0].args[1];

                expect(callback).to.have.callCount(1);
                expect(calledWith.healthy).to.eql(true);
                expect(calledWith.checks.db).to.eql('ok');
            });
        });

        it('should return unhealthy if db rejects promise', () => {

            const dbCheckStubReject = sinon.stub().returnsPromise().rejects({message: 'rubbish'});

            return healthcheckProxy(dbCheckStubReject)(callback).then(() => {

                const calledWith = callback.getCalls()[0].args[1];

                expect(callback).to.have.callCount(1);
                expect(calledWith.healthy).to.eql(false);
                expect(calledWith.checks.db).to.eql('rubbish');
            });
        });
    });
});
