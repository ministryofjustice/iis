const {
    searchNomis, getNomisResults, getNomisToken, clearToken, onlyPrisonNumber
} = require('../../data/nomisSearch');

const config = require('../../server/config');

const chai = require('chai');
const expect = chai.expect;

const agent = require('superagent');
const nock = require('nock');

function searchResponse(token, query, status, response) {
    nock('http://localhost:9090')
        .matchHeader('Authorization', token)
        .get('/api/v2/prisoners')
        .query(query)
        .reply(status, response);
}

function tokenResponse(status, token) {
    nock('http://localhost:9090')
        .post('/api/users/login')
        .reply(status, {'token': token});
}

beforeEach(() => {
    config.nomis.enabled = true;
    nock.cleanAll();
    clearToken();
});


describe('nomisSearch', () => {

    describe('getNomisResults', () => {

        it('should return error if no searchable query terms', (done) => {

            const userInput = {notSearchable: '123'};

            getNomisResults('token', userInput).then(nomisData => {
                expect.fail();
            }).catch(error => {
                expect(error.code).to.eql('emptySubmission');
                done();
            });
        });

        it('should return empty if only prison number', (done) => {

            const userInput = {prisonNumber: '123'};

            getNomisResults('token', userInput).then(nomisData => {
                expect(nomisData).to.eql([]);
                done();
            });
        });

        it('should return the correctly formatted nomis response', (done) => {

            const userInput = {forename: 'john'};
            const expected = [{"firstName": "john"}];
            searchResponse('token', {firstName: 'john'}, 200, [{"firstName": "john"}]);

            getNomisResults('token', userInput).then(nomisData => {
                expect(nomisData).to.eql(expected);
                done();
            });
        });

        it('should return error when nomis response error', (done) => {

            const userInput = {forename: 'john'};
            searchResponse('token', {firstName: 'john'}, 401, 'something awful happened');

            getNomisResults('token', userInput).then(nomisData => {
                expect.fail();
            }).catch(error => {
                expect(error.status).to.eql(401);
                done();
            });
        });
    });


    describe('getNomisToken', () => {

        it('should acquire the nomis token', (done) => {

            tokenResponse(201, 'sometoken');

            getNomisToken().then(token => {
                expect(token).to.eql('sometoken');
                done();
            })
        });

    });

    describe('searchNomis', () => {

        it('should acquire token on first query', (done) => {

            const userInput = {forename: 'john'};
            const expected = [{"firstName": "john"}];

            tokenResponse(201, 'sometoken');
            searchResponse('sometoken', {firstName: 'john'}, 200, [{"firstName": "john"}]);

            searchNomis(userInput).then(nomisData => {
                expect(nomisData).to.eql(expected);
                done();
            });
        });

        it('should reuse the existing token on second query', (done) => {

            const userInput = {forename: 'john'};
            const expected = [{"firstName": "john"}];

            tokenResponse(201, 'sometoken');
            tokenResponse(201, 'othertoken-notused');
            searchResponse('sometoken', {firstName: 'john'}, 200, [{"firstName": "john"}]);
            searchResponse('sometoken', {firstName: 'john'}, 200, [{"firstName": "john"}]);

            searchNomis(userInput).then(nomisData => {
                expect(nomisData).to.eql(expected);

                searchNomis(userInput).then(nomisData => {
                    expect(nomisData).to.eql(expected);
                    done();
                });

            });
        });

        it('should report error when token acquisition error', (done) => {

            const userInput = {forename: 'john'};

            tokenResponse(404, 'tokenResponseError');

            searchNomis(userInput).then(nomisData => {
                expect.fail();
            }).catch(error => {
                expect(error.status).to.eql(404);
                done();
            });
        });

        it('should report error when nomis query error', (done) => {

            const userInput = {forename: 'john'};

            tokenResponse(201, 'sometoken');
            searchResponse('sometoken', {firstName: 'john'}, 404, 'blah');

            searchNomis(userInput).then(nomisData => {
                expect.fail();
            }).catch(error => {
                expect(error.status).to.eql(404);
                done();
            });
        });


        it('should refresh token when 401', (done) => {

            config.nomis.tokenRetries = 2;

            const userInput = {forename: 'john'};
            const expected = [{"firstName": "john"}];

            tokenResponse(201, 'firstToken');
            searchResponse('firstToken', {firstName: 'john'}, 401, '');

            tokenResponse(201, 'secondToken');
            searchResponse('secondToken', {firstName: 'john'}, 200, [{"firstName": "john"}]);

            searchNomis(userInput).then(nomisData => {
                expect(nomisData).to.eql(expected);
                done();
            });
        });
    });

    describe('onlyPrisonNumber', () => {

        it('should be true when prisonNumber is only search term', () => {
            expect(onlyPrisonNumber({prisonNumber: '1'})).to.be.true;
        });

        it('should be false when prisonNumber is not present', () => {
            expect(onlyPrisonNumber({notPrisonNumber: '1'})).to.be.false;
        });

        it('should be false when prisonNumber and another term present', () => {
            expect(onlyPrisonNumber({prisonNumber: '1', surname: '2'})).to.be.false;
        });
    });


});

