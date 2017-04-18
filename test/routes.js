'use strict';
process.env.NODE_ENV = 'test';
let request = require('supertest');
let expect = require('chai').expect;

let common = require('./common');
let app = require("../server/app");

describe('Test redirections when session set and not set', function() {

    it('should return status code 302, when session NOT set', function() {
        request(app).get('/search')
            .expect(302)
            .expect("Location", "/login");
    });

    // Zed
    it.skip('should create session when POSTing to /login with valid credentials', function() {
        let check = common.userStub();

        return request(app).post("/login")
            .send({loginId: "glen", pwd: "password", disclaimer: "disclaimer"})
            .expect(302)
            .then(() => {
                expect(check.calledOnce).to.be.true;
                expect(check.calledWith("glen", "password")).to.be.true;
            });
    });

    it('should display error when disclaimer is not checked', function() {
        return request(app).post("/disclaimer")
            .send({})
            .expect(400)
            .expect(function(res) {
                expect(res.text).to.contain('error-summary')
            });
    });

    it('should NOT display error when disclaimer is checked', function() {

        return request(app).post("/disclaimer")
            .send({ disclaimer: "disclaimer"})
            .expect(302);
    });

    it('should return status code 200, when session IS set', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.get('/search')
                    .expect(200);
            });
    });

    it('should redirect to the search page when root is visited while the sessions are set', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.get('/')
                    .expect(302)
                    .expect("Location", "/search");
            });
    });

    // Zed
    it.skip('should return status code 200', function(done) {
        request(app).get('/login').expect(200, done);
    });

    it('should return status code 200 if an option hasnt been selected', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search')
                    .expect(200)
                    .expect(function(res) {
                        expect(res.text).to.contain('error-summary')
                    });
            });
    });

    it('should return 302 if at least one option has been selected', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search')
                    .send({option: 'names'})
                    .expect(302)
                    .expect("Location", '/search/form?0=names');
            });
    });

    it('should redirect to appropriate url if multiple selected', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search')
                    .send({option: ["names", "dob"]})
                    .expect(302)
                    .expect("Location", "/search/form?0=names&1=dob")
            });
    });

    // Zed
    it.skip('should redirect to login page when user logs out', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.get('/logout')
                    .expect(302)
                    .expect("Location", "/login")
            });
    });

    it.skip('testing my tests if they test fine', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.get('/search/identifier')
                    .expect(200)
            });
    });

});


