var request = require('supertest');
var expect = require('chai').expect;
var sinon = require("sinon");
var bcrypt = require("bcryptjs");
var db = require('../db');
var users = require("../data/users");

var app = require("../server.js");

var s;
beforeEach(() => {
    s = sinon.sandbox.create();
});
afterEach(() => {
    s.restore(); 
});

function logInAs(username) {
    s.stub(users, "checkUsernameAndPassword").yields(null, true);
    
    var browser = request.agent(app);
    return browser.post("/login")
        .send({login_id: username, pwd: "thisisapassword"})
        .expect(302)
        .then(function() {
            return browser;
        });
}
    
describe('Test redirections when session set and not set', function(){     
    it('should return status code 302, when session NOT set', function(){
        request(app).get('/search')
            .expect(302)
            .expect("Location", "/login");
    });

    it('should create session when POSTing to /login with valid credentials', function() {
        var check = s.stub(users, "checkUsernameAndPassword").yields(null, true);

        return request(app).post("/login")
            .send({login_id: "glen", pwd: "password"})
            .expect(302)
            .then(() => {
                expect(check.calledOnce).to.be.true;
                expect(check.calledWith("glen", "password")).to.be.true;
            });
    });

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

});


