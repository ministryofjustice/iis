'use strict';

let request = require('supertest');
let expect = require('chai').expect;
let common = require('./common');

const audit = require('../data/audit');
let app = require("../server/app");

let db = require('../server/db');
let subject = require("../data/subject");
let search = require("../data/search");

let EventEmitter = require("events").EventEmitter;

function prepareFakeDB(onRequest) {
    db.setFakeFactory(function fakeDBFactory() {
        let fake = new EventEmitter();
        process.nextTick(function() {
            fake.emit("connect");
        });
        fake.execSql = function(req) {
            onRequest(req);
        };
        return fake;
    });
}

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
                    .send({opt: 'identifier'})
                    .expect(302)
            })
            .then(function() {
                return browser.post('/search/identifier')
                    .send({prisonNumber: 'AA123456'})
                    .expect(302)
                    .expect("Location", "/search/results")
            })
            .then(function() {
                common.sinon.stub(search, 'totalRowsForUserInput').yields(null, 0);
                common.sinon.stub(audit, "record");
                return browser.get('/search/results')
                    .set('Referer', 'somewhere')
            })
            .then(function() {
                common.sinon.assert.calledOnce(audit.record);
                common.sinon.assert.calledWithExactly(audit.record, "SEARCH", "test@test.com", {prisonNumber: 'AA123456'});
            });
    });

    it('should record view event with prison id and page type', function() {

        const fakeSubject = {prisonNumber: 'AA123456', forename: 'Name'};
        common.sinon.stub(subject, "info").yields(null, fakeSubject);

        const fakeSummary = {};
        common.sinon.stub(subject, "summary").yields(null, fakeSummary);

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
