process.env.NODE_ENV = 'test';

const proxyquire = require('proxyquire');
proxyquire.noCallThru();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();

describe('Subject data', function() {

    const standardResponse = [{
        JSON1: {
            value: JSON.stringify({
                "prisonNumber":"AB111111",
                "summary":{
                    "identifier":{
                        "prisonNumber":"AB111111",
                        "person":1234567891,
                        "pnc":"012345\/99A",
                        "cro":"012345\/99C",
                        "parole":[{"ref":"AA12311"}]
                    },
                    "name":{
                        "initial":"F",
                        "first":"FIRSTA",
                        "middle":"MIDDLEA",
                        "last":"SURNAMEA"
                    },
                    "sex":"M",
                },
                "hdcRecall":[{
                    "createdDate":"2001-01-01",
                    "curfewEndDate":"2001-01-02",
                    "outcomeDate":"2001-01-02",
                    "outcome":"Licence revoked: recalled",
                    "reason":"BREACH CONDITIONS 38A1(a)"
                }]
            })
        }
    }];

    const expectedReturnValue = {
        prisonNumber: "AB111111",
        summary:{
            identifier: {
                prisonNumber: "AB111111",
                person: 1234567891,
                pnc: "012345\/99A",
                cro: "012345\/99C",
                parole: [{ref:"AA12311"}]
            },
            name: {
                initial: "F",
                first: "FIRSTA",
                middle: "MIDDLEA",
                last: "SURNAMEA"
            },
            sex: "M",
        },
        hdcRecall: [{
            createdDate: "2001-01-01",
            curfewEndDate: "2001-01-02",
            outcomeDate: "2001-01-02",
            outcome: "Licence revoked: recalled",
            reason: "BREACH CONDITIONS 38A1(a)"
        }]
    };

    let getCollectionStub = sandbox.stub().callsArgWith(2, standardResponse);
    let getTupleStub = sandbox.stub().returns(null);

    const subjectProxy = (getCollection = getCollectionStub,
                          getTuple = getTupleStub) => {
        return proxyquire('../data/subject2', {
            '../server/iisData': {
                'getCollection': getCollection,
                'getTuple': getTuple
            }
        });
    };

    afterEach(() => {
        sandbox.reset();
    });

    it('should return expected info object', () => {

        const result = subjectProxy().getSubject('AB111111', ['summary']);
        return result.then(data => {
            expect(data).to.deep.equal(expectedReturnValue);
        });
    });

    it("should return expected object when response is split", () => {

        const splitJson = standardResponse[0].JSON1.value.split(/("M")/);

        const splitResponse = [
            {
                JSON1: {value: splitJson[0], meta: 'something'}
            },
            {
                JSON2: {value: splitJson[1].concat(splitJson[2]), meta: 'somethingElse'}
            }
        ];

        const getCollectionStub = sandbox.stub().callsArgWith(2, splitResponse);
        const result = subjectProxy(getCollectionStub).getSubject('AB111111', ['summary']);


        return result.then(data => {
            expect(data).to.deep.equal(expectedReturnValue);
        });
    });


    describe('select clause', () => {
        const options = [
            {page: 'addresses', sql: ', JSON_QUERY(ADDRESSES) AS addresses'},
            {page: 'aliases', sql: ', JSON_QUERY(ALIASES) AS aliases'},
            {page: 'courtHearings', sql: ', JSON_QUERY(COURT_HEARINGS) AS courtHearings'},
            {page: 'hdcInfo', sql: ', JSON_QUERY(HDC_INFO) AS hdcInfo'},
            {page: 'hdcRecall', sql: ', JSON_QUERY(HDC_RECALL) AS hdcRecall'},
            {page: 'movements', sql: ', JSON_QUERY(MOVEMENTS) AS movements'},
            {page: 'offences', sql: ', JSON_QUERY(OFFENCES) AS offences'},
            {page: 'offencesInCustody', sql: ', JSON_QUERY(OFFENCES_IN_CUSTODY) AS offencesInCustody'},
            {page: 'sentencing', sql: ', JSON_QUERY(SENTENCING) AS sentencing'},
        ];

        it('should always request summary data', () => {
            options.forEach(option => {
                subjectProxy().getSubject('AB111111', [option.page]);
                expect(getCollectionStub).to.have.callCount(1);
                const sql = getCollectionStub.getCalls()[0].args[0];

                expect(sql).to.contain('JSON_QUERY(PERSONAL_DETAILS) AS summary');
                sandbox.reset();
            });
        });

        it('should include the specific data needed', () => {
            options.forEach(option => {
                subjectProxy().getSubject('AB111111', [option.page]);
                expect(getCollectionStub).to.have.callCount(1);
                const sql = getCollectionStub.getCalls()[0].args[0];

                expect(sql).to.contain(option.sql);
                sandbox.reset();
            });
        });

        it('should be able to hand multiple requests', () => {
            subjectProxy().getSubject('AB111111', ['offences', 'sentencing']);
            expect(getCollectionStub).to.have.callCount(1);
            const sql = getCollectionStub.getCalls()[0].args[0];

            expect(sql).to.contain('JSON_QUERY(PERSONAL_DETAILS) AS summary, ' +
                'JSON_QUERY(OFFENCES) AS offences, ' +
                'JSON_QUERY(SENTENCING) AS sentencing');
            sandbox.reset();
        });
    });

});
