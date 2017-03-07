'use strict';

let request = require('supertest');
let expect = require('chai').expect;
let common = require('./common');
let app = require("../server.js");


describe('Date/Age/Age-range validation tests', function(){

   it('should display error if an invalid date is passed', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({ opt: 'dob', dobDay: '29', dobMonth: '02', dobYear: '2017'})
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary');
                    });
            });
   });

   it('should display error if the date is in the future', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({opt: 'dob', dobDay: '20', dobMonth: '12', dobYear: '2020'})
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                    });
            });
   });

    it('should return 302 if the date is valid', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({opt: 'dob', dobDay: '10', dobMonth: '6', dobYear: '1960'})
                    .expect(302)
            });
    });


   it('should display error if the age is not a valid number', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({age: '-13'})
                    .expect(200)
            });
    });


    it('should display error if the age range is not valid', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({opt: 'age', age: '33-30'})
                    .expect(200)
            });
    });

   it('should return 302 if age range is valid', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({opt: 'age', age: '30-33'})
                    .expect(302)
            });
    });


});


