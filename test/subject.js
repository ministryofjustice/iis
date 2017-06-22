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

    let getCollectionStub = sandbox.stub().returns(null);
    let getTupleStub = sandbox.stub().returns(null);

    const subjectProxy = (getCollection = getCollectionStub,
                          getTuple = getTupleStub) => {
        return proxyquire('../data/subject', {
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
        let infoResponse = {
            PK_PRISON_NUMBER: {value: 'AA112233'},
            FK_PERSON_IDENTIFIER: {value: '123456789'},
            INMATE_SURNAME: {value: 'SURNAME'},
            INMATE_FORENAME_1: {value: 'FORENAMEA'},
            INMATE_FORENAME_2: {value: 'FORENAME2'},
            DATE_1ST_RECEP: {value: '20131211'},
            PNC: {value: 'ABC/99A'},
            CRO: {value: 'XYZ/11Z'},
            PAROLE_REF_LIST: {value: 'AAA1,BB2'},
            DOB: {value: '19800101'},
            BIRTH_COUNTRY_CODE: {value: '1'},
            MARITAL_STATUS_CODE: {value: 'S'},
            ETHNIC_GROUP_CODE: {value: 'W1'},
            NATIONALITY_CODE: {value: 'UK'},
            RELIGION_CODE: {value: 'ANG '},
            INMATE_SEX: {value: 'Male'}
        };

        let expectedInfo = {
            prisonNumber: 'AA112233',
            personIdentifier: '123456789',
            surname: 'SURNAME',
            forename: 'Forenamea',
            forename2: 'Forename2',
            pnc: 'ABC/99A',
            cro: 'XYZ/11Z',
            paroleRefList: 'AAA1,BB2',
            dob: '01/01/1980',
            countryOfBirth: 'England',
            maritalStatus: 'Single',
            ethnicity: 'White British',
            nationality: 'United Kingdom',
            religion: 'Anglican',
            sex: 'Male',
            age: 37,
            dateOfFirstReception: '11/12/2013'
        };

        getTupleStub = sandbox.stub().callsArgWith(2, infoResponse);
        const result = subjectProxy(getCollectionStub, getTupleStub).getSubject('AA112233');
        return result.then((data) => {
            expect(data).to.deep.equal(expectedInfo);
        });
    });

    it("should return array of expected addresses objects", () => {

        let address1 = {
            INMATE_ADDRESS_1: {value: '1 STREET'},
            INMATE_ADDRESS_2: {value: 'A TOWN'},
            INMATE_ADDRESS_4: {value: 'REGIONA'},
            ADDRESS_TYPE: {value: 'H'},
            PERSON_DETS: {value: 'NAME A'}
        };

        let address2 = {
            INMATE_ADDRESS_1: {value: '2 STREET'},
            INMATE_ADDRESS_2: {value: 'B TOWN'},
            INMATE_ADDRESS_4: {value: ''},
            ADDRESS_TYPE: {value: ' '},
            PERSON_DETS: {value: ''}
        };

        let expectedAddresses = [{
            addressLine1: '1 Street',
            addressLine2: 'A Town',
            addressLine4: 'Regiona',
            type: 'Home',
            name: 'Name A'
        }, {
            addressLine1: '2 Street',
            addressLine2: 'B Town',
            addressLine4: '',
            type: 'Unknown',
            name: ''
        }];

        getCollectionStub = sandbox.stub().callsArgWith(2, [address1, address2]);
        const result = subjectProxy(getCollectionStub, getTupleStub).getAddresses({prisonNumber: 'AA112233'});
        return result.then((data) => {
            expect(data).to.deep.equal(expectedAddresses);
        });
    });

    it("should return expected HDC history object", function() {

        let historyResponse = {
            STAGE_DATE: {value: '19990101'},
            STAGE: {value: '2'},
            HDC_STATUS: {value: '8'},
            HDC_REASON: {value: '[{"code":1},{"code":1},{"code":2}]'}
        };

        let expectedHdcHistory = [{
            date: '01/01/1999',
            stage: 'HDC eligibility',
            status: 'Eligible',
            reason: 'HDC granted - enhanced board, HDC granted - suit assess'
        }];

        getCollectionStub = sandbox.stub().callsArgWith(2, [historyResponse]);
        const result = subjectProxy(getCollectionStub, getTupleStub).getHDCInfo({prisonNumber: 'AA112233'});
        return result.then((data) => {
            expect(data).to.deep.equal(expectedHdcHistory);
        });
    });

    it("should return expected HDC recall object", function() {

        let recallResponse = {
            RECALL_DATE_CREATED: {value: '19990101'},
            ORIGINAL_CURFEW_END_DATE: {value: '19990101'},
            RECALL_OUTCOME: {value: '2'},
            RECALL_OUTCOME_DATE: {value: '19990101'},
            REASON_ID: {value: '1'}
        };

        let expectedHdcRecall = [{
            dateCreated: '01/01/1999',
            originalCurfewEndDate: '01/01/1999',
            outcomeDate: '01/01/1999',
            outcome: 'Re-released following recall',
            reason: 'Breach conditions 38a1(a)'
        }];

        getCollectionStub = sandbox.stub().callsArgWith(2, [recallResponse]);
        const result = subjectProxy(getCollectionStub, getTupleStub).getHDCRecall({prisonNumber: 'AA112233'});
        return result.then((data) => {
            expect(data).to.deep.equal(expectedHdcRecall);
        });
    });

    it("should return expected Aliases object", function() {

        let aliasOne = {
            PERSON_SURNAME: {value: 'AAA'},
            PERSON_FORENAME_1: {value: 'A'},
            PERSON_FORENAME_2: {value: 'AA'},
            PERSON_BIRTH_DATE: {value: '19800101'}
        };

        let aliasTwo = {
            PERSON_SURNAME: {value: 'BBB'},
            PERSON_FORENAME_1: {value: 'B'},
            PERSON_FORENAME_2: {value: 'BB'},
            PERSON_BIRTH_DATE: {value: '19800202'}
        };

        let expectedAliases = [{
            surname: 'Aaa',
            forename: 'A',
            forename2: 'Aa',
            dob: '01/01/1980'
        }, {
            surname: 'Bbb',
            forename: 'B',
            forename2: 'Bb',
            dob: '02/02/1980'
        }];

        getCollectionStub = sandbox.stub().callsArgWith(2, [aliasOne, aliasTwo]);
        const result = subjectProxy(getCollectionStub, getTupleStub).getAliases({prisonNumber: 'AA112233'});
        return result.then((data) => {
            expect(data).to.deep.equal(expectedAliases);
        });
    });


    it("should return expected adjudications object", function() {

        let adjudicationsResponse = {
            ESTABLISHMENT: {value: 'PORTSMOUTH'},
            ADJ_CHARGE: {value: '11'},
            DATE_OF_FINDING: {value: '19990101'},
            OUTCOME_OF_HEARING: {value: '1'}
        };

        let expectedAdjudications = [{
            establishment: 'Portsmouth',
            charge: 'Assault on prison officer',
            date: '01/01/1999',
            outcome: 'Proved'
        }];

        getCollectionStub = sandbox.stub().callsArgWith(2, [adjudicationsResponse]);
        const result = subjectProxy(getCollectionStub, getTupleStub).getAdjudications({prisonNumber: 'AA112233'});
        return result.then((data) => {
            expect(data).to.deep.equal(expectedAdjudications);
        });
    });


    it("should return expected court hearings object", function() {

        let courtHearingResponse = {
            HEARING_DATE: {value: '19990101'},
            COURT_NAME: {value: 'SOME COURT'}
        };

        let expectedCourHearing = [{
            date: '01/01/1999',
            court: 'Some Court'
        }];

        getCollectionStub = sandbox.stub().callsArgWith(2, [courtHearingResponse]);
        const result = subjectProxy(getCollectionStub, getTupleStub).getCourtHearings({prisonNumber: 'AA112233'});
        return result.then((data) => {
            expect(data).to.deep.equal(expectedCourHearing);
        });
    });

    it("should return expected sentence history object", function() {

        let sentenceHistoryResponse = {
            SENTENCE_CHANGE_DATE: {value: '19990101'},
            REASON_SENT_DET_CHANGE: {value: 'SOME REASON'},
            EFFECTIVE_SENTENCE_LENGTH: {value: '123'},
            SENTENCE_EXPIRY_DATE: {value: '19990101'},
            PED: {value: ''},
            NPD: {value: ''},
            LED: {value: ''},
            CRD: {value: ''},
            HDCAD: {value: ''},
            HDCED: {value: ''},
        };

        let expectedSentenceHistory = [{
            changeDate: '01/01/1999',
            reasonCode: 'Some reason',
            length: '123',
            keyDates: {
                'SED':'01/01/1999',
            }
        }];

        getCollectionStub = sandbox.stub().callsArgWith(2, [sentenceHistoryResponse]);
        const result = subjectProxy(getCollectionStub, getTupleStub).getSentenceHistory({prisonNumber: 'AA112233'});
        return result.then((data) => {
            expect(data).to.deep.equal(expectedSentenceHistory);
        });
    });
});
