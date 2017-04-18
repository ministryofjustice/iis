'use strict';
process.env.NODE_ENV = 'test';
let common = require('./common');

describe('Date/Age/Age-range validation tests', function() {

    it('should redirect and display error if an invalid date is passed', function() {
        return common.logInAs('someone')
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=dob')
                    .set('referer', '/search/ ')
                    .send({dobOrAge: 'dob', dobDay: '29', dobMonth: '02', dobYear: '2017'})
                    .expect(302)
                    .expect('Location', '/search');
            });
    });

    it('should redirect if the date is in the future', function() {
        return common.logInAs('someone')
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=dob')
                    .set('referer', '/search/ ')
                    .send({dobOrAge: 'dob', dobDay: '20', dobMonth: '12', dobYear: '2020'})
                    .expect(302)
                    .expect('Location', '/search');
            });
    });

    it('should return 302 if the date is valid and redirect to results', function() {
        return common.logInAs('someone')
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=dob')
                    .send({dobOrAge: 'dob', dobDay: '10', dobMonth: '6', dobYear: '1960'})
                    .expect(302)
                    .expect('Location', '/search/results');
            });
    });

    it('should redirect if the age is not a valid number', function() {
        return common.logInAs('someone')
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=dob')
                    .set('referer', '/search/ ')
                    .send({age: '-13'})
                    .expect(302)
                    .expect('Location', '/search');
            });
    });

    it('should redirect if the age range is not valid', function() {
        return common.logInAs('someone')
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=dob')
                    .set('referer', '/search/ ')
                    .send({dobOrAge: 'age', age: '33-30'})
                    .expect(302)
                    .expect('Location', '/search');
            });
    });

    it('should redirect if the age range is more than 5 years', function() {
        return common.logInAs('someone')
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=dob')
                    .set('referer', '/search/ ')
                    .send({dobOrAge: 'age', age: '33-40'})
                    .expect(302)
                    .expect('Location', '/search');
            });
    });

    it('should return 302 if the age range is valid and redirect to results', function() {
        return common.logInAs('someone')
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=dob')
                    .send({dobOrAge: 'age', age: '30-33'})
                    .expect(302)
                    .expect('Location', '/search/results');
            });
    });
});


