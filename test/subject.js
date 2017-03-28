'use strict';

let expect = require('chai').expect;
let db = require('../server/db');
let subject = require("../data/subject");

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


describe('Subject/inmate details', function(){
    it.skip("should return array of columns", function(done) {
        prepareFakeDB(function(req) {
            expect(req.sqlTextOrProcedure).to.contain("WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER");
            let result = [{PK_PRISON_NUMBER:{value: 'AA112233'}}];
            req.callback(null, 1, [result]);
        });

        subject.details('AA112233', function(err, data) {
            expect(err).to.be.null;
            expect(data).to.be.an("array");
            done();
        });
    });
});
