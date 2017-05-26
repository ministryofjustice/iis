process.env.NODE_ENV = 'test';

let request = require('supertest');
const chai = require('chai');
let expect = chai.expect;
let common = require('./common');

const audit = require('../data/audit');
let app = require("../server/app");

let db = require('../server/db');
let subject = require("../data/subject");
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

    it('should record search event with search inputs', function() {
        let browser;
        return common.logInAs()
            .then(function(_browser) {
                browser = _browser;
            })
            .then(function() {
                return browser.post('/search')
                    .send({option: 'identifier'})
                    .expect(302)
                    .expect("Location", "/search/form?0=identifier")
            })
            .then(function() {
                return browser.post('/search/form')
                    .send({prisonNumber: 'AA123456'})
                    .expect(302)
                    .expect("Location", "/search/results")
            })
            .then(function() {
                common.sinon.stub(search, 'totalRowsForUserInput').returnsPromise().resolves(0);
                common.sinon.stub(audit, "record");
                return browser.get('/search/results')
                    .set('Referer', 'somewhere')
            })
            .then(function() {
                common.sinon.assert.calledOnce(audit.record);
                common.sinon.assert.calledWithExactly(audit.record, "SEARCH", "test@test.com", {prisonNumber: 'AA123456'});
            });
    });

    it.skip('should record view event with prison id and page type', function() {

        const fakeSummary = {prisonNumber: 'AA123456', forename: 'Name'};
        common.sinon.stub(subject, "getSubject").yields(null, fakeSummary);

        let browser;
        return common.logInAs()
            .then(function(_browser) {
                browser = _browser;
            })
            .then(function() {
                common.sinon.stub(audit, "record");
                return browser
                    .get('/subject/AA123456/summary')
                    .set('Referer', 'somewhere')
            })
            .then(function() {
                return browser
                    .get('/subject/AA123456/movements')
                    .set('Referer', 'somewhere')
            })
            .then(function() {
                common.sinon.assert.calledTwice(audit.record);
                common.sinon.assert.calledWith(
                    audit.record, "VIEW", "test@test.com", {page: 'summary', prisonNumber: 'AA123456'}
                );
                common.sinon.assert.calledWith(
                    audit.record, "VIEW", "test@test.com", {page: 'movements', prisonNumber: 'AA123456'}
                );
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
