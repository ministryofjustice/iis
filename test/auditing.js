process.env.NODE_ENV = 'test';

let request = require('supertest');
const chai = require('chai');
let expect = chai.expect;
let common = require('./common');

const audit = require('../data/audit');
let app = require("../server/app");

let db = require('../server/db');
let search = require("../data/search");

const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const TYPES = require('tedious').TYPES;

describe('Auditing', function() {

    it('should record login event', function() {
        common.sinon.stub(audit, "record");
        return request(app).get('/disclaimer')
            .expect(200)
            .then(function() {
                common.sinon.assert.calledOnce(audit.record);
                common.sinon.assert.calledWith(audit.record, "LOG_IN", "test@test.com");
            });
    });

    it('should record disclaimer accepted event', function() {
        common.sinon.stub(audit, "record");
        return request(app).post('/disclaimer')
            .send({disclaimer: 'disclaimer'})
            .expect(302)
            .then(function() {
                common.sinon.assert.calledOnce(audit.record);
                common.sinon.assert.calledWith(audit.record, "DISCLAIMER_ACCEPTED", "test@test.com");
            });
    });


});

describe('Audit', () => {
    let addRowStub = sandbox.stub().callsArgWith(2, 14);

    const record = (addRow = addRowStub) => {
        return proxyquire('../data/audit', {
            '../server/auditData': {
                'addRow': addRow,
            }
        }).record;
    };

    afterEach(() => {
        sandbox.reset();
    });

    describe('inmate', () => {
        it('should reject if unspecified key', () => {
            expect(() => record()('Key', 'a@y.com', {data: 'data'})).to.throw(Error);

        });

        it('should call auditData.addRow', () => {
            const result = record()('SEARCH', 'a@y.com', {data: 'data'});

            return result.then((data) => {
                expect(addRowStub).to.have.callCount(1);
            });
        });

        it('should pass the sql paramaters', () => {
            const result = record()('SEARCH', 'a@y.com', {data: 'data'});
            const expectedParameters = [
                {column: 'user', type: TYPES.VarChar, value: 'a@y.com'},
                {column: 'action', type: TYPES.VarChar, value: 'SEARCH'},
                {column: 'details', type: TYPES.VarChar, value: JSON.stringify({data: 'data'})}
            ];

            return result.then((data) => {
                expect(addRowStub.getCall(0).args[1]).to.eql(expectedParameters);
            });
        });
    });
});
