'use strict';

let request = require('supertest');
let expect = require('chai').expect;
let sinon = require("sinon");
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

let app = require("../server/app.js");

let sandbox;

beforeEach(() => {
    exports.sinon = sandbox = sinon.sandbox.create();
    sandbox.assert = sinon.assert;
});

afterEach(() => {
    sandbox.restore();
});

exports.logInAs = function() {

    let browser = request.agent(app);

    return browser.post("/disclaimer")
        .send({disclaimer: "disclaimer"})
        .expect(302)
        .then(function() {
            return browser;
        });

};
