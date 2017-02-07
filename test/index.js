var request = require('supertest');
var expect = require('chai').expect;
var bcrypt = require("bcryptjs");
var db = require('../db');
var users = require("../data/users");

var app = require("../server.js");

var passwordHashed = bcrypt.hashSync("thisisapassword");

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

function logInAs(username) {
    prepareFakeDB(function(req) {
        req.callback(null, 1);
        req.emit("row", [{value: passwordHashed}]);
    });
    
    var agent = request.agent(app);
    return agent.post("/login")
        .send({login_id: username, pwd: "thisisapassword"})
        .expect(302)
        .then(function() {
            return agent;
        });
}

describe('IIS App Routines', function() {
    
    describe('Test redirections when session set and not set', function(){     
        it('should return status code 302, when session NOT set', function(){
            request(app).get('/search')
                .expect(302)
                .expect("Location", "/login");
        });
        
        //it('should create session when POSTing to /login')
        
        it('should return status code 200, when session IS set', function(){
            return logInAs("someone")
                .then(function(authedReq) {
                    return authedReq.get('/search')
                        .expect(200);
                });
        });
        

        it('should return status code 200', function(done){
            request(app).get('/login').expect(200,done); 
        });
        
        // test root redirections (should always go to login?)
    });
    
    
    
    describe('validating username and password', function(){
        it("should return ok if username and password match", function(done) {
            prepareFakeDB(function(req) {
                req.callback(null, 1);
                req.emit("row", [{value: passwordHashed}]);
            });
            
            users.checkUsernameAndPassword("abc", "thisisapassword", function(err, result) {
                expect(err).to.be.null;
                expect(result).to.be.true;
                done();
            });
        });
        it("should return false if username not found", function(done) {
            prepareFakeDB(function(req) {
                req.callback(null, 0);
            });
            
            users.checkUsernameAndPassword("abc", "thisisapassword", function(err, result) {
                expect(err).to.be.null;
                expect(result).to.be.false;
                done();
            });
        });
        it("should return false if password is wrong", function(done) {
            prepareFakeDB(function(req) {
                req.callback(null, 1);
                req.emit("row", [{value: "nottherighthash"}]);
            });
            
            users.checkUsernameAndPassword("abc", "thisisapassword", function(err, result) {
                expect(err).to.be.null;
                expect(result).to.be.false;
                done();
            });
        });
        it("should error if DB query errors", function(done) {
            prepareFakeDB(function(req) {
                req.callback(new Error("I don't like your face"));
            });
            
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
