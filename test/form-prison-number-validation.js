'use strict';

let request = require('supertest');
let expect = require('chai').expect;

let common = require('./common');
let app = require("../server.js");


describe('Prison number validation tests', function(){

   it('should redirect and display error to the user if prison number is empty', function(){
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/identifier')
                    .set('referer', '/search/ ')
                    .send({prison_number: ''})
                    .redirects(1)
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                });
            });
   });

    it('should redirect and display error to the user if the format is invalid: AA00AA00', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/identifier')
                    .set('referer', '/search/ ')
                    .send({prison_number: 'AA00AA00'})
                    .redirects(1)
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                });
            });
    });

    it('should redirect and display error to the user if the format is invalid: 11AAAAA', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/identifier')
                    .set('referer', '/search/ ')
                    .send({prison_number: '11AAAAA'})
                    .redirects(1)
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                });
            });
    });

    it('should redirect and display error to the user if prison number length is less than 8: AA00000', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/identifier')
                    .set('referer', '/search/ ')
                    .send({prison_number: 'AA00000'})
                    .redirects(1)
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


