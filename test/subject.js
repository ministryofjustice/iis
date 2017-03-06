var expect = require('chai').expect;
var db = require('../db');
var subject = require("../data/subject");

var EventEmitter = require("events").EventEmitter;
function prepareFakeDB(onRequest) {
    db.setFakeFactory(function fakeDBFactory() {
        var fake = new EventEmitter();
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
    it("should return array of columns", function(done) {
        prepareFakeDB(function(req) {
            expect(req.sqlTextOrProcedure).to.contain("WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER");
            var result = [{PK_PRISON_NUMBER:{value: 'AA112233'}}];
            req.callback(null, result);
            req.emit("row", result);
        });

        subject.details('AA112233', function(err, data) {
            expect(err).to.be.null;
            expect(data).to.be.an("array");
            done();
        });
    });
});