'use strict';
process.env.NODE_ENV = 'test';
let common = require('./common');

describe('Prison number validation tests', function() {

    it('should redirect and display error to the user if everything is empty', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=identifier')
                    .set('referer', '/search/ ')
                    .send({
                        prisonNumber: '',
                        pncNumber: '',
                        croNumber: ''
                    })
                    .expect(302)
                    .expect('Location', '/search');

            });
    });

    it('should return 302 if the prison number format is valid', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                authedReq.post('/search')
                    .send({opt: 'results'})
                    .expect(302, function() {
                        return authedReq.post('/search/form?0=identifier')
                            .send({prisonNumber: 'AA000000'})
                            .expect(302)
                            .expect("Location", "/results")
                    });
            });
    });

    it('should return 302 if the prison number not supplied but PNC is supplied', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                authedReq.post('/search')
                    .send({opt: 'results'})
                    .expect(302, function() {
                        return authedReq.post('/search/form?0=identifier')
                            .send({
                                prison_number: '',
                                pncNumber: 'A'
                            })
                            .expect(302)
                            .expect("Location", "/results")
                    });
            });
    });

    it('should return 302 if the prison number not supplied but CRO is supplied', function() {
        return common.logInAs("someone")
            .then(function(authedReq) {
                authedReq.post('/search')
                    .send({opt: 'results'})
                    .expect(302, function() {
                        return authedReq.post('/search/form?0=identifier')
                            .send({
                                prison_number: '',
                                croNumber: 'A'
                            })
                            .expect(302)
                            .expect("Location", "/results")
                    });
            });
    });
});


