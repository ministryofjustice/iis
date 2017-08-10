const {
    translateResult
} = require('../../data/nomis/resultTranslator');

const chai = require('chai');
const expect = chai.expect;

describe('nomisResultTranslator', () => {


    it('should convert results to match HPA', () => {
        const results = [
            {
                "dateOfBirth": "1980-01-01",
                "firstName": "john",
                "lastName": "smith",
                "nomsId": "1234",
                "additionalProperties": {},
                "middleNames": "alan",
                "gender": "male",
                "nationalities": [
                    "UK"
                ],
                "pncNumber": "123",
                "croNumber": "456",
                "paroleNumbers": "123,456",
                "ethnicity": "white",
                "birthCountry": "england",
                "religion": "catholic",
                "receptionDate": "2011-01-01",
                "maritalStatus": "single"
            }
        ];

        const expected = [
            {
                "dob": "1980-01-01",
                "firstName": "john",
                "lastName": "smith",
                "nomsId": "1234",
                "additionalProperties": {},
                "middleName": "alan",
                "gender": "male",
                "nationality": "UK",
                "pncNumber": "123",
                "croNumber": "456",
                "paroleNumbers": "123,456",
                "ethnicity": "white",
                "birthCountry": "england",
                "religion": "catholic",
                "receptionDate": "2011-01-01",
                "maritalStatus": "single"
            }
        ];

        expect(translateResult(results)).to.eql(expected);
    });

});
