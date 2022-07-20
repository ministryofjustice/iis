'use strict';
process.env.NODE_ENV = 'test';
let request = require('supertest');
let expect = require('chai').expect;

let common = require('./common');
let app = require("../server/app");

describe('Test redirections when session set and not set', function() {

    it('should successfully show splash screen', function() {
        return request(app).get("/splash")
            .expect(200)
            .expect(function(res) {
                expect(res.text).to.contain('Important')
            });
    });

    it('should return status code 302, when session NOT set', function() {
        request(app).get('/search')
            .expect(302)
            .expect("Location", "/login");
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

    it('should redirect to search if non admin user tries to access admin', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/admin')
                    .expect(302)
                    .expect("Location", "/search")
            });
    });

});


