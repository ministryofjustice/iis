let expect = require('chai').expect;
let db = require('../server/db');
let search = require('../data/search');

let EventEmitter = require('events').EventEmitter;

function prepareFakeDB(onRequest) {
    db.setFakeFactory(function fakeDBFactory() {
        let fake = new EventEmitter();
        process.nextTick(function() {
            fake.emit('connect');
        });
        fake.execSql = function(req) {
            onRequest(req);
        };
        return fake;
    });
}

const standardResponse = {
    INMATE_FORENAME_1: {},
    INMATE_FORENAME_2: {},
    INMATE_SURNAME: {value: 'David'},
    SENTENCING_COURT: {},
    PK_PRISON_NUMBER: {},
    DOB: {},
    ALIAS: {}
}

describe('Search', function() {
    it('should return recordset as an array', function(done) {

        prepareFakeDB(function(req) {
            req.callback(null, 1, [standardResponse]);
        });

        search.inmate({prisonNumber: 7}, function(err, data) {
            expect(err).to.be.null;
            expect(data).to.be.an('array');
            done();
        });
    });

    describe('WHERE statement', () => {
        it('should populate prison number if passed in', (done) => {
            prepareFakeDB(function(req) {
                expect(req.sqlTextOrProcedure).to.contain('WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER');
                expect(req.parametersByName.PK_PRISON_NUMBER.value).to.equal(7);
                req.callback(null, 1, [standardResponse]);
            });

            search.inmate({prisonNumber: 7}, function(err, data) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should populate name if passed in', (done) => {
            prepareFakeDB(function(req) {
                expect(req.sqlTextOrProcedure).to.contain('WHERE INMATE_FORENAME_1 = @INMATE_FORENAME_1');
                expect(req.parametersByName.INMATE_FORENAME_1.value).to.equal('DAVE');
                req.callback(null, 1, [standardResponse]);
            });

            search.inmate({forename: 'Dave'}, function(err, data) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should populate full name if passed in', (done) => {
            prepareFakeDB(function(req) {
                expect(req.sqlTextOrProcedure).to.contain('WHERE INMATE_FORENAME_1 = @INMATE_FORENAME_1 AND ' +
                    'INMATE_FORENAME_2 = @INMATE_FORENAME_2 AND ' +
                    'INMATE_SURNAME = @INMATE_SURNAME');
                expect(req.parametersByName.INMATE_FORENAME_1.value).to.equal('DAVE');
                expect(req.parametersByName.INMATE_FORENAME_2.value).to.equal('JAMES');
                expect(req.parametersByName.INMATE_SURNAME.value).to.equal('JONES');
                req.callback(null, 1, [standardResponse]);
            });

            search.inmate({forename: 'Dave', forename2: 'James', surname: 'Jones'}, function(err, data) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should populate dob if passed in', (done) => {
            prepareFakeDB(function(req) {
                expect(req.sqlTextOrProcedure).to.contain('WHERE INMATE_BIRTH_DATE = @INMATE_BIRTH_DATE');
                expect(req.parametersByName.INMATE_BIRTH_DATE.value).to.equal('NANDATE');
                req.callback(null, 1, [standardResponse]);
            });

            search.inmate({dobOrAge: 'dob', dobDay: 'date'}, function(err, data) {
                expect(err).to.be.null;
                done();
            });
        });

        it('should combine where statements', (done) =>{
            prepareFakeDB(function(req) {
                expect(req.sqlTextOrProcedure).to.contain('WHERE PK_PRISON_NUMBER = @PK_PRISON_NUMBER AND ' +
                    'INMATE_FORENAME_1 = @INMATE_FORENAME_1');
                expect(req.parametersByName.PK_PRISON_NUMBER.value).to.equal(7);
                expect(req.parametersByName.INMATE_FORENAME_1.value).to.equal('DAVE');
                req.callback(null, 1, [standardResponse]);
            });

            search.inmate({prisonNumber: 7, forename: 'Dave'}, function(err, data) {
                expect(err).to.be.null;
                done();
            });
        });
    });

    it('should order the data by surname, first initial then dob', function(done) {
        prepareFakeDB(function(req) {
            expect(req.sqlTextOrProcedure).to.contain('ORDER BY ' +
                'INMATE_SURNAME, SUBSTRING(INMATE_FORENAME_1, 1, 1), DOB');
            req.callback(null, 1, [standardResponse]);
        });

        search.inmate({prisonNumber: 7}, function(err, data) {
            expect(err).to.be.null;
            done();
        });
    });
});
