'use strict';

let expect = require('chai').expect;
let db = require('../server/db');
let search = require('../data/search');
let common = require('./common');
let app = require("../server.js");

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


describe('Search', function(){
//    it("should return recordset as an array", function(done) {
//        prepareFakeDB(function(req) {
//            expect(req.sqlTextOrProcedure).to.contain('WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER');
//            req.callback(null, 1, [{INMATE_SURNAME: {value: "David"}}]);
//        });
//
//        search.inmate({prisonNumber: 7}, function(err, data) {
//            expect(err).to.be.null;
//            expect(data).to.be.an("array");
//            done();
//        });
//    });
});
