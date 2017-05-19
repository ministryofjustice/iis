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
    INMATE_FORENAME_1: {},
    INMATE_FORENAME_2: {},
    INMATE_SURNAME: {value: 'David'},
    SENTENCING_COURT: {},
    PK_PRISON_NUMBER: {},
    DOB: {},
    ALIAS: {},
    DATE_1ST_RECEP: {}
}];

describe('Search', () => {
    let getCollectionStub = sandbox.stub().callsArgWith(2, standardResponse);
    let getTupleStub = sandbox.stub().returns(null);

    const inmateProxy = (getCollection = getCollectionStub,
                         getTuple = getTupleStub) => {
        return proxyquire('../data/search', {
            '../server/db': {
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
                    'dob': 'Invalid date',
                    'firstReceptionDate': 'Invalid date',
                    'forename': undefined,
                    'forename2': undefined,
                    'prisonNumber': undefined
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

        it.skip('should populate name if passed in', () => {
            const result = inmateProxy()({forename: 'Dave'});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE INMATE_FORENAME_1 LIKE @INMATE_FORENAME_1');
                expect(params[0].column).to.eql('INMATE_FORENAME_1');
                expect(params[0].value).to.eql('Dave');
            });
        });

        it.skip('should populate full name if passed in', () => {
            const result = inmateProxy()({forename: 'Dave', forename2: 'James', surname: 'Jones'});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE INMATE_FORENAME_1 LIKE @INMATE_FORENAME_1 AND ' +
                    'INMATE_FORENAME_2 LIKE @INMATE_FORENAME_2 AND ' +
                    'INMATE_SURNAME LIKE @INMATE_SURNAME');

                expect(params[0].column).to.eql('INMATE_FORENAME_1');
                expect(params[0].value).to.eql('Dave');

                expect(params[1].column).to.eql('INMATE_FORENAME_2');
                expect(params[1].value).to.eql('James');

                expect(params[2].column).to.eql('INMATE_SURNAME');
                expect(params[2].value).to.eql('Jones');
            });
        });

        it('should populate dob if passed in', () => {
            const result = inmateProxy()({dobOrAge: 'dob', dobDay: 'date'});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE INMATE_BIRTH_DATE = @INMATE_BIRTH_DATE');
                expect(params[0].column).to.eql('INMATE_BIRTH_DATE');
                expect(params[0].value).to.eql('NaNdate');
            });

        });

        it.skip('should combine where statements', () => {
            const result = inmateProxy()({prisonNumber: 7, forename: 'Dave'});

            return result.then((data) => {
                const sql = getCollectionStub.getCalls()[0].args[0];
                const params = getCollectionStub.getCalls()[0].args[1];

                expect(sql).to.contain('WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER AND ' +
                    'INMATE_FORENAME_1 LIKE @INMATE_FORENAME_1');
                expect(params[0].column).to.eql('PK_PRISON_NUMBER');
                expect(params[0].value).to.eql(7);
                expect(params[1].column).to.eql('INMATE_FORENAME_1');
                expect(params[1].value).to.eql('Dave');
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
