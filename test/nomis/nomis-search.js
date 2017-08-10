const {
    getNomisResults, getNomisToken
} = require('../../data/nomisSearch');

const chai = require('chai');
const expect = chai.expect;

var agent = require('superagent');
var nock = require('nock');

describe('nomisSearch', () => {


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
            console.log(nomisData);
            expect(nomisData).to.eql(expected);
            done();
        });
    });

    it('should acquire the nomis token', (done) => {

        nock('http://localhost:9090').post('/api/users/login')
            .reply(201, {'token': 'sometoken'}, {'Content-Type': 'application/json'});

        getNomisToken().then(token => {
            expect(token).to.eql('sometoken');
            done();
        })
    });

    // to do
    // auth errors, connection errors, etc

});

