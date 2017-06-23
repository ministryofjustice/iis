process.env.NODE_ENV = 'test';

const proxyquire = require('proxyquire');
proxyquire.noCallThru();

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();

const standardResponse = [{
    PK_PRISON_NUMBER: {},
    INMATE_FORENAME_1: {},
    INMATE_FORENAME_2: {},
    INMATE_SURNAME: {value: 'DAVID'},
    DOB: {value: '19990101'},
    DATE_1ST_RECEP: {},
    PERSON_FORENAME_1: {},
    PERSON_FORENAME_2: {},
    PERSON_SURNAME: {value: 'ALIAS'},
    PERSON_BIRTH_DATE: {value: '19990202'},
}];

describe('Search', () => {
    let getCollectionStub = sandbox.stub().callsArgWith(2, standardResponse);
    let getTupleStub = sandbox.stub().returns(null);

    const inmateProxy = (getCollection = getCollectionStub,
                         getTuple = getTupleStub) => {
        return proxyquire('../data/search', {
            '../server/iisData': {
                'getCollection': getCollection,
                'getTuple': getTuple
            }
        }).inmate;
    };

    afterEach(() => {
        sandbox.reset();
    });

    describe('inmate', () => {

        it('should call db.getCollection', () => {
            const result = inmateProxy()({prisonNumber: 7});

            return result.then((data) => {
                expect(getCollectionStub).to.have.callCount(1);
            });
        });

        it('should return recordset as an array', () => {
            const result = inmateProxy()({prisonNumber: 7});

            return result.then((data) => {
                expect(data).to.be.an('array');
            });
        });

        it('should correctly format the result', () => {
            const result = inmateProxy()({prisonNumber: 7});
            const expectedResult = [
                {
                    'surname': 'DAVID',
                    'dob': '01/01/1999',
                    'firstReceptionDate': 'Invalid date',
                    'forename': "",
                    'forename2': "",
                    'prisonNumber': undefined,
                    'alias' : 'Alias'
                }
            ];

            return result.then((data) => {
                expect(data).to.eql(expectedResult);
            });
        });
    });

    describe('WHERE statement', () => {

        it('should populate prison number if passed in', () => {
            const result = inmateProxy()({prisonNumber: 7});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER');
                expect(params[0].column).to.eql('PK_PRISON_NUMBER');
                expect(params[0].value).to.eql(7);
            });
        });

        it('should populate PNC number if passed in', () => {
            const result = inmateProxy()({pncNumber: 7});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain("WHERE iis.IIS_IDENTIFIER.PERSON_IDENT_TYPE_CODE = 'PNC'");
                expect(sql).to.contain("AND iis.IIS_IDENTIFIER.PERSON_IDENTIFIER_VALUE = @PNC");
                expect(params[0].column).to.eql('PNC');
                expect(params[0].value).to.eql(7);
            });
        });

        it('should populate CRO number if passed in', () => {
            const result = inmateProxy()({croNumber: 7});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain("WHERE iis.IIS_IDENTIFIER.PERSON_IDENT_TYPE_CODE = 'CRO'");
                expect(sql).to.contain("AND iis.IIS_IDENTIFIER.PERSON_IDENTIFIER_VALUE = @CRO");
                expect(params[0].column).to.eql('CRO');
                expect(params[0].value).to.eql(7);
            });
        });

        it('should populate name if passed in', () => {
            const result = inmateProxy()({forename: 'Dave'});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE PERSON_FORENAME_1 LIKE @PERSON_FORENAME_1');
                expect(params[0].column).to.eql('PERSON_FORENAME_1');
                expect(params[0].value).to.eql('Dave');
            });
        });

        it('should populate full name if passed in', () => {
            const result = inmateProxy()({forename: 'Dave', forename2: 'James', surname: 'Jones'});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE PERSON_FORENAME_1 LIKE @PERSON_FORENAME_1 AND ' +
                    'PERSON_FORENAME_2 LIKE @PERSON_FORENAME_2 AND ' +
                    'PERSON_SURNAME LIKE @PERSON_SURNAME');

                expect(params[0].column).to.eql('PERSON_FORENAME_1');
                expect(params[0].value).to.eql('Dave');

                expect(params[1].column).to.eql('PERSON_FORENAME_2');
                expect(params[1].value).to.eql('James');

                expect(params[2].column).to.eql('PERSON_SURNAME');
                expect(params[2].value).to.eql('Jones');
            });
        });

        it('should populate dob if passed in', () => {
            const result = inmateProxy()({dobOrAge: 'dob', dobDay: 'date'});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE PERSON_BIRTH_DATE = @PERSON_BIRTH_DATE');
                expect(params[0].column).to.eql('PERSON_BIRTH_DATE');
                expect(params[0].value).to.eql('NaNdate');
            });

        });

        it('should combine where statements', () => {
            const result = inmateProxy()({prisonNumber: 7, forename: 'Dave'});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER AND ' +
                    'PERSON_FORENAME_1 LIKE @PERSON_FORENAME_1');
                expect(params[0].column).to.eql('PK_PRISON_NUMBER');
                expect(params[0].value).to.eql(7);
                expect(params[1].column).to.eql('PERSON_FORENAME_1');
                expect(params[1].value).to.eql('Dave');
            });
        });

        it('should populate gender if passed in', () => {
            const result = inmateProxy()({gender: ['M']});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE (PERSON_SEX = @gender0)');
                expect(params[0].column).to.eql('gender0');
                expect(params[0].value).to.eql('M');
            });
        });

        it('should be able to populate multiple genders', () => {
            const result = inmateProxy()({gender: ['M', 'F']});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE (PERSON_SEX = @gender0 OR PERSON_SEX = @gender1)');
                expect(params[0].column).to.eql('gender0');
                expect(params[0].value).to.eql('M');
                expect(params[1].column).to.eql('gender1');
                expect(params[1].value).to.eql('F');
            });
        });

        it('should populate hasHDC if passed in', () => {
            const result = inmateProxy()({hasHDC: true});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];

                expect(sql).to.contain('exists (select 1 from IIS.HDC_HISTORY WHERE FK_PRISON_NUMBER = PK_PRISON_NUMBER)');
            });
        });
    });

    it('should order the data by surname, first initial, then date of first reception.', () => {
        const result = inmateProxy()({prisonNumber: 7});

        return result.then((data) => {
            const sql = getCollectionStub.getCalls()[0].args[0];
            const params = getCollectionStub.getCalls()[0].args[1];

            expect(sql).to.contain('INMATE_SURNAME, SUBSTRING(INMATE_FORENAME_1, 1, 1), DOB, DATE_1ST_RECEP DESC');
        });
    });
});
