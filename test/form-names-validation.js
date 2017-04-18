'use strict';
process.env.NODE_ENV = 'test';
let common = require('./common');

describe('Name(s) validation tests', function(){

   it('should redirect and display error if all the names are empty strings', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=names')
                    .set('referer', '/search/ ')
                    .send({forename: '', forename2: '', surname: ''})
                    .expect(302)
                    .expect('Location', '/search');
            });
   });

   it('should redirect and display error if the names have a number or special character', function(){
       return common.logInAs("someone")
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=names')
                    .set('referer', '/search/ ')
                    .send({forename: 'Zed', forename2: 'Forename2', surname: ''})
                    .expect(302)
                    .expect('Location', '/search');

            });
   });

    it('should return 302 if the name is valid and redirect to results', function() {
        return common.logInAs('someone')
            .then(function(authedReq) {
                return authedReq.post('/search/form?0=names')
                    .send({forename: 'Zed', forename2: '', surname: 'Ali'})
                    .expect(302)
                    .expect('Location', '/search/results');
            });
    });
});


