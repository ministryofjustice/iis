var request = require('supertest');
var expect = require('chai').expect;
var sinon = require("sinon");
var app = require("../server.js");
var users = require("../data/users");

var s;
beforeEach(() => {
    s = sinon.sandbox.create();
});
afterEach(() => {
    s.restore(); 
});


module.exports = {
    logInAs: function (username) {
        s.stub(users, "checkUsernameAndPassword").yields(null, true);

        var browser = request.agent(app);
        return browser.post("/login")
            .send({login_id: username, pwd: "thisisapassword"})
            .expect(302)
            .then(function() {
                return browser;
            });
    },
    
    userStub: function() {
        return s.stub(users, "checkUsernameAndPassword").yields(null, true)
    }
}