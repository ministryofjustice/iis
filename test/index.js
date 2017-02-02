var expect = require('chai').expect;

var bcrypt = require("bcryptjs");

var db = require('../db');
//var request = require('request');

var users = require("../data/users");


var EventEmitter = require("events").EventEmitter;
function makeFakeDB(onRequest) {
    var fake = new EventEmitter();
    process.nextTick(function() {
        fake.emit("connect");
    });
    fake.execSql = function(req) {
        onRequest(req);
    };
    return fake;
}

describe('IIS App Routines', function() {
    
    
    describe('validating username and password', function(){
        var passwordHashed = bcrypt.hashSync("thisisapassword");
        it("should return ok if username and password match", function(done) {
            var fakeDB = makeFakeDB(function(req) {
                req.callback(null, 1);
                req.emit("row", [{value: passwordHashed}]);
            });
            
            db.setFake(fakeDB);
            users.checkUsernameAndPassword("abc", "thisisapassword", function(err, result) {
                expect(err).to.be.null;
                expect(result).to.be.true;
                done();
            });
        });
        it("should return false if username not found", function(done) {
            var fakeDB = makeFakeDB(function(req) {
                req.callback(null, 0);
            });
            
            db.setFake(fakeDB);
            users.checkUsernameAndPassword("abc", "thisisapassword", function(err, result) {
                expect(err).to.be.null;
                expect(result).to.be.false;
                done();
            });
        });
        it("should return false if password is wrong", function(done) {
            var fakeDB = makeFakeDB(function(req) {
                req.callback(null, 1);
                req.emit("row", [{value: "nottherighthash"}]);
            });
            
            db.setFake(fakeDB);
            users.checkUsernameAndPassword("abc", "thisisapassword", function(err, result) {
                expect(err).to.be.null;
                expect(result).to.be.false;
                done();
            });
        });
        it("should error if DB query errors", function(done) {
            var fakeDB = makeFakeDB(function(req) {
                req.callback(new Error("I don't like your face"));
            });
            
            db.setFake(fakeDB);
            users.checkUsernameAndPassword("abc", "thisisapassword", function(err, result) {
                expect(err).to.be.an("error");
                done();
            });
        });
    });
    /*
    describe('access secure area when session is NOT set', function(){
        
    });
    
    describe('access secure area when session IS not set', function(){
        
    });
    */
    

    /*
    describe('Go to login page', function(){
        var url = 'http://localhost:3000/login';
    
        it('returns status 200', function(done) {
            request(url, function(error, response, body) {
                console.log('----',error,response,body);
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });
    */

});
