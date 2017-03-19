'use strict';

let request = require('supertest');
let expect = require('chai').expect;
let sinon = require("sinon");
let app = require("../server.js");
// let users = require("../data/users");

let s;

beforeEach(() => {
    s = sinon.sandbox.create();
});

afterEach(() => {
    s.restore();
});

module.exports = {
    logInAs: function(username) {
        // s.stub(users, "checkUsernameAndPassword").yields(null, true);

        let browser = request.agent(app);

        return browser.post("/disclaimer")
            .send({disclaimer: "disclaimer"})
            .expect(302)
            .then(function() {
                return browser;
            });

    },

    // userStub: function() {
    //     return s.stub(users, "checkUsernameAndPassword").yields(null, true)
    // }
};
