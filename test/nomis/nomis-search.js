const {
    getNomisResults, getNomisToken
} = require('../../data/nomisSearch');

const chai = require('chai');
const expect = chai.expect;

var agent = require('superagent');
var nock = require('nock');

describe('nomisSearch', () => {


    describe('getNomisResults', () => {

        it('should return empty list if no searchable query terms', (done) => {

            const userInput = {prisonNumber: '123'};

            getNomisResults(userInput, 'token').then(nomisData => {
                expect(nomisData).to.eql([]);
                done();
            });
        });

        it('should return the correctly formatted nomis response', (done) => {

            const userInput = {forename: 'john'};
            const nomisResponse = [{"firstName": "john"}];
            const expected = [{"firstName": "john"}];

            nock('http://localhost:9090', {
                reqheaders: {'Authorization': 'WRONGtoken'} // why doesn't this make any difference?
            }).get('/api/v2/prisoners')
                .query({firstName: 'john'})
                .reply(200, nomisResponse, {'Content-Type': 'application/json'});

            getNomisResults(userInput, 'token').then(nomisData => {
                expect(nomisData).to.eql(expected);
                done();
            });
        });

        it('should return error message when nomis response error', (done) => {

            const userInput = {forename: 'john'};
            const expectedError = { error: 'NOMIS query access error' };

            nock('http://localhost:9090').get('/api/v2/prisoners')
                .query({firstName: 'john'})
                .replyWithError('something awful happened');

            getNomisResults(userInput, 'token').then(nomisData => {
                expect.fail();
            }).catch(error => {
                expect(error).to.eql(expectedError);
                done();
            });
        });

    });


    describe('getNomisToken', () => {

        it('should acquire the nomis token', (done) => {

            nock('http://localhost:9090').post('/api/users/login')
                .reply(201, {'token': 'sometoken'}, {'Content-Type': 'application/json'});

            getNomisToken().then(token => {
                expect(token).to.eql('sometoken');
                done();
            })
        });

    });


});

