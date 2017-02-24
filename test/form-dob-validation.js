var request = require('supertest');
var expect = require('chai').expect;

var common = require('./common');
var app = require("../server.js");


describe('Date/Age/Age-range validation tests', function(){
   it('should display error if an invalid date is passed', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({this_page: 'dob', opt: 'dob', dob_day: '29', dob_month: '02', dob_year: '2017'})
                    .expect(200)
                    .expect(function(res){
                        expect(res.text).to.contain('error-summary')
                    });
            });
   });

   it('should display error if the date is in the future', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({this_page: 'dob', opt: 'dob', dob_day: '20', dob_month: '12', dob_year: '2020'})
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
                    .send({this_page: 'dob', opt: 'dob', dob_day: '10', dob_month: '6', dob_year: '1960'})
                    .expect(302)
            });
    });


   it('should display error if the age is not a valid number', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({this_page: 'dob', opt: 'age', age: '-13'})
                    .expect(200)
            });
    });
    

    it('should display error if the age range is not valid', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({this_page: 'dob', opt: 'age', age: '33-30'})
                    .expect(200)
            });
    });
    
   it('should return 302 if age range is valid', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/dob')
                    .send({this_page: 'dob', opt: 'age', age: '30-33'})
                    .expect(302)
            });
    });
    
   
});


