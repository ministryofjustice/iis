const {
    postPrintForm
} = require('../../controllers/printController');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const content = require('../../data/content');
const proxyquire = require('proxyquire');
proxyquire.noCallThru();
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);

let reqMock;
let resMock;
let subjectStub;
let sentenceHistoryStub;
let courtHearingsStub;
let movementsStub;
let aliasesStub;
let addressesStub;
let offencesStub;
let hdcinfoStub;
let hdcrecallStub;
let createPdfStub;
let auditStub;

const getController = ({subject = subjectStub,
                        sentenceHistory = sentenceHistoryStub,
                        courtHearings = courtHearingsStub,
                        movements = movementsStub,
                        aliases = aliasesStub,
                        addresses = addressesStub,
                        offences = offencesStub,
                        hdcinfo = hdcinfoStub,
                        hdcrecall = hdcrecallStub,
                        createPdf = createPdfStub} = {}) => {
    return proxyquire('../../controllers/printController', {
        '../data/subject': {
            'getSubject': subject,
            'getSentenceHistory': sentenceHistory,
            'getCourtHearings': courtHearings,
            'getMovements': movements,
            'getAliases': aliases,
            'getAddresses': addresses,
            'getOffences': offences,
            'getHDCInfo': hdcinfo,
            'getHDCRecall': hdcrecall
        },
        './helpers/pdfHelpers': {
            'createPdf': createPdf
        },
        '../data/audit': {
            'record': auditStub
        }
    });
};


describe('printController', () => {

    beforeEach(() => {
        subjectStub = sandbox.stub().returnsPromise().resolves({
            prisonNumber: '     id1',
            forename: 'Matthew',
            forename2: 'James',
            surname: 'Whitfield',
        });
        sentenceHistoryStub = sandbox.stub().returnsPromise().resolves([{sentence: '1'}]);
        courtHearingsStub = sandbox.stub().returnsPromise().resolves([{courtHearing: '1'}]);
        movementsStub = sandbox.stub().returnsPromise().resolves([{movement: '1'}]);
        aliasesStub = sandbox.stub().returnsPromise().resolves([{alias: '1'}]);
        addressesStub = sandbox.stub().returnsPromise().resolves([{address: '1'}]);
        offencesStub = sandbox.stub().returnsPromise().resolves([{offence: '1'}]);
        hdcinfoStub = sandbox.stub().returnsPromise().resolves([{hdc: '1'}]);
        hdcrecallStub = sandbox.stub().returnsPromise().resolves([{recall: '1'}]);
        createPdfStub = sandbox.stub();
        auditStub = sandbox.spy();

        reqMock = {
            body: {
                printOption: ['subject', 'custodyOffences']
            },
            query: {prisonNo: '12345678', fields: ['subject', 'custodyOffences']},
            user: {email: 'x@y.com'}
        };
        resMock = {render: sandbox.spy(), redirect: sandbox.spy(), status: sandbox.spy(), writeHead: sandbox.spy()};
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getPrintForm', () => {
        it('should render the print form page if id is passed in with url', () => {
            reqMock = {
                query: {prisonNo: '12345678'}
            };

            getController().getPrintForm(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.have.been.calledWith('print', {
                content: content.view.print,
                prisonNumber: '12345678',
                name: {forename: 'Matthew', surname: 'Whitfield'},
                err: null
            });
        });

        it('should render with ui error if user error is passed in, with no name', () => {
            reqMock = {
                query: {prisonNo: '12345678', err: 'noneSelected'}
            };

            getController().getPrintForm(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.have.been.calledWith('print', {
                content: content.view.print,
                prisonNumber: '12345678',
                name: {forename: 'Matthew', surname: 'Whitfield'},
                err: {title: content.view.print.noneSelected}
            });
        });

        it('should render with db error and no name if db error in query', () => {
            reqMock = {
                query: {prisonNo: '12345678', err: 'db'}
            };

            getController().getPrintForm(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.have.been.calledWith('print', {
                content: content.view.print,
                prisonNumber: '12345678',
                name: null,
                err: {title: content.pdf.dbError.title, desc: content.pdf.dbError.desc}
            });
        });

        it('should return to search page if no prison number passed in', () => {
            reqMock = {
                query: {}
            };

            getController().getPrintForm(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith('/search');
        });
    });

    describe('postPrintForm', () => {

        it('should redirect to the pdf with the appropriate query string', () => {

            const expectedUrl = '/print/pdf?prisonNo=12345678&fields=subject&fields=custodyOffences';

            postPrintForm(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith(expectedUrl);
        });

        it('should audit the search', () => {
            getController().postPrintForm(reqMock, resMock);
            expect(auditStub).to.have.callCount(1);
        });

        it('should pass the appropriate data to audit', () => {
            getController().postPrintForm(reqMock, resMock);
            expect(auditStub).to.be.calledWith('PRINT', 'x@y.com', {prisonNo: '12345678',
                fieldsPrinted: ['subject', 'custodyOffences']});
        });

        it('should remove any unexpected inputs', () => {
            reqMock = {
                body: {
                    printOption: ['subject', 'custodyOffences', 'matt']
                },
                query: {prisonNo: '12345678'},
                user: {email: 'x@y.com'},
            };

            const expectedUrl = '/print/pdf?prisonNo=12345678&fields=subject&fields=custodyOffences';

            postPrintForm(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith(expectedUrl);
        });

        it('should return to print form if no items are selected', () => {
            reqMock = {
                body: {printOption: []},
                query: {prisonNo: '12345678'},
                user: {email: 'x@y.com'},
            };

            getController().postPrintForm(reqMock, resMock);
            expect(resMock.render).to.have.been.calledWith('print', {content: content.view.print,
                prisonNumber: '12345678',
                name: null,
                err: {title: 'Please select at least one item to print'},
                name: {forename: 'Matthew', surname: 'Whitfield' }
            });
        });
    });

    describe('getPdf', () => {

        it('should redirect to search form if nothing in query string', () => {
            reqMock = {
                query: {}
            };
            getController().getPdf(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith('/search');
        });

        it('should get the data for the fields in the query string', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['subject', 'addresses']}
            };
            getController().getPdf(reqMock, resMock);
            expect(subjectStub).to.have.callCount(1);
            expect(addressesStub).to.have.callCount(1);
        });

        it('should call createPdf if all data requests resolve successfully', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['subject', 'addresses']}
            };
            return getController().getPdf(reqMock, resMock).then(() => {
                expect(createPdfStub).to.have.callCount(1);
            });
        });

        it('should pass in the data to createpdf', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['subject', 'addresses']}
            };

            const expectedPrintItems = ['subject', 'addresses'];
            const expectedData = [{
                prisonNumber: '     id1',
                forename: 'Matthew',
                forename2: 'James',
                surname: 'Whitfield',
            }, [{address: '1'}]];
            const expectedOptions = {
                type: 'searchPrint',
                name: {
                    forename: 'Matthew',
                    surname: 'Whitfield',
                    prisonNumber: '     id1'
                }
            };

            return getController().getPdf(reqMock, resMock).then(() => {
                expect(createPdfStub.getCall(0).args[1]).to.eql(expectedPrintItems);
                expect(createPdfStub.getCall(0).args[2]).to.eql(expectedData);
                expect(createPdfStub.getCall(0).args[4]).to.eql(expectedOptions);
            });
        });

        it('should get name and id details even if subject is not requested', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['offences', 'addresses']}
            };

            const expectedPrintItems = ['offences', 'addresses'];
            const expectedData = [[{offence: '1'}], [{address: '1'}]];
            const expectedOptions = {
                type: 'searchPrint',
                name: {
                    forename: 'Matthew',
                    surname: 'Whitfield',
                    prisonNumber: '     id1'
                }
            };

            return getController().getPdf(reqMock, resMock).then(() => {
                expect(createPdfStub.getCall(0).args[1]).to.eql(expectedPrintItems);
                expect(createPdfStub.getCall(0).args[2]).to.eql(expectedData);
                expect(createPdfStub.getCall(0).args[4]).to.eql(expectedOptions);
            });
        });

        it('should work if only 1 item is requested', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: 'addresses'}
            };

            const expectedPrintItems = ['addresses'];
            const expectedData = [[{address: '1'}]];
            const expectedOptions = {
                type: 'searchPrint',
                name: {
                    forename: 'Matthew',
                    surname: 'Whitfield',
                    prisonNumber: '     id1'
                }
            };

            return getController().getPdf(reqMock, resMock).then(() => {
                expect(createPdfStub.getCall(0).args[1]).to.eql(expectedPrintItems);
                expect(createPdfStub.getCall(0).args[2]).to.eql(expectedData);
                expect(createPdfStub.getCall(0).args[4]).to.eql(expectedOptions);
            });
        });

        it('should not call createPdf if any data requests resolve unsuccessfully', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['subject', 'addresses']}
            };

            const subjectStub = sandbox.stub().returnsPromise().rejects();
            return getController({subject: subjectStub}).getPdf(reqMock, resMock).then(() => {
                expect(createPdfStub).to.have.callCount(0);
            });
        });

        it('should redirect to print page if any data requests resolve unsuccessfully', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['subject', 'addresses']}
            };

            const subjectStub = sandbox.stub().returnsPromise().rejects();
            return getController({subject: subjectStub}).getPdf(reqMock, resMock).then(() => {
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/print?prisonNo=12345678&err=db');
            });
        });
    });
});
