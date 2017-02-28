var expect = require('chai').expect;
var db = require('../db');
var search = require("../data/search");

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


describe('search', function(){
    it("should something", function(done) {
        prepareFakeDB(function(req) {
            expect(req.sqlTextOrProcedure).to.contain("WHERE prison_number");
            req.callback(null, 1);
            req.emit("row", {name:{value: "bob"}});
        });

        search.inmate({prison_number: 7}, function(err, inmates) {
            expect(err).to.be.null;
            expect(inmates).to.be.an("array");
            done();
        });
    });
});