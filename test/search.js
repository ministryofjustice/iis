'use strict';

var expect = require('chai').expect;
var db = require('../server/db');
var search = require('../data/search');

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

describe('Search', function(){

    it("should return recordset as an array", function(done) {
        prepareFakeDB(function(req) {
            expect(req.sqlTextOrProcedure).to.contain('WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER');
            req.callback(null, 1, [{INMATE_SURNAME: {value: "David"}}]);
        });

        search.inmate({prisonNumber: 7}, function(err, data) {
            expect(err).to.be.null;
            expect(data).to.be.an("array");
            done();
        });
    });
});
