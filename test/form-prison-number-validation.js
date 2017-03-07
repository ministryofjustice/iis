'use strict';

var request = require('supertest');
var expect = require('chai').expect;

var common = require('./common');
var app = require("../server.js");


describe('Prison number validation tests', function(){
   it('should display error to the user if prison number is empty', function(){
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/identifier')
                    .send({prison_number: ''})
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                });
            });
   });

    it('should display error to the user if the format is invalid: AA00AA00', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/identifier')
                    .send({prison_number: 'AA00AA00'})
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                });
            });
    });

    it('should display error to the user if the format is invalid: 11AAAAA', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/identifier')
                    .send({prison_number: '11AAAAA'})
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                });
            });
    });

    it('should display error to the user if prison number length is less than 8: AA00000', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/identifier')
                    .send({prison_number: 'AA00000'})
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                    });
                });
    });

   it('should return 302 if the prison number format is valid', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                authedReq.post('/search')
                    .send({opt: 'results'})
                    .expect(302, function(){
                        return authedReq.post('/search/identifier')
                            .send({prison_number: 'AA000000'})
                            .expect(302)
                            .expect("Location", "/results")
                    });
            });
   });

});


