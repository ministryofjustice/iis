'use strict';

var request = require('supertest');
var expect = require('chai').expect;

var common = require('./common');
var app = require("../server.js");


describe('Name(s) validation tests', function(){

   it('should display error if all the names are empty strings', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/names')
                    .send({forename: '', forename2: '', surname: ''})
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                    });
            });
   });

   it('should display error if the names have a number or special character', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/names')
                    .send({forename: 'Zed', forename2: 'Forename2', surname: ''})
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                    });
            });
   });

   it('should return 302 if the name(s) are valid', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                authedReq.post('/search')
                    .send({opt: 'results'})
                    .expect(302)
                    .then(() => {
                        return authedReq.post('/search/names')
                            .send({forename: 'Zed', forename2: '', surname: 'Ali'})
                            .expect(302)
                            .expect("Location", "/results")
                });
            });
   });
});


