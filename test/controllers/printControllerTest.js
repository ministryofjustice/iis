const {
    getPrintForm,
    postPrintForm,
    getPdf
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

describe('printController', () => {
    let reqMock;
    let resMock;

    beforeEach(() => {
        reqMock = {
            body: {
                printOption: ['summary', 'custodyOffences']
            },
            query: {prisonNo: '12345678', fields: ['summary', 'custodyOffences']}
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

            getPrintForm(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.have.been.calledWith('print', {content: content.view.print});
        });

        it('should return to search page if no prison number passed in', () => {
            reqMock = {
                query: {}
            };

            getPrintForm(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith('/search');
        });
    });

    describe('postPrintForm', () => {

        it('should redirect to the pdf with the appropriate query string', () => {

            const expectedUrl = '/print/pdf?prisonNo=12345678&fields=summary&fields=custodyOffences';

            postPrintForm(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith(expectedUrl);
        });

        it('should remove any unexpected inputs', () => {
            reqMock = {
                body: {
                    printOption: ['summary', 'custodyOffences', 'matt']
                },
                query: {prisonNo: '12345678'}
            };

            const expectedUrl = '/print/pdf?prisonNo=12345678&fields=summary&fields=custodyOffences';

            postPrintForm(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith(expectedUrl);
        });

        it('should return to print form if no items are selected', () => {
            reqMock = {
                body: {printOption: []},
                query: {prisonNo: '12345678'}
            };

            postPrintForm(reqMock, resMock);
            expect(resMock.render).to.have.been.calledWith('print', {content: content.view.print});
        });
    });

    describe('getPdf', () => {

        let subjectStub;
        let movementsStub;
        let aliasesStub;
        let addressesStub;
        let offencesStub;
        let hdcinfoStub;
        let hdcrecallStub;
        let createPdfStub;

        beforeEach(() => {
            subjectStub = sandbox.stub().returnsPromise().resolves({
                prisonNumber: '     id1',
                forename: 'Matthew',
                forename2: 'James',
                surname: 'Whitfield',
            });
            movementsStub = sandbox.stub().returnsPromise().resolves([{movement: '1'}]);
            aliasesStub = sandbox.stub().returnsPromise().resolves([{alias: '1'}]);
            addressesStub = sandbox.stub().returnsPromise().resolves([{address: '1'}]);
            offencesStub = sandbox.stub().returnsPromise().resolves([{offence: '1'}]);
            hdcinfoStub = sandbox.stub().returnsPromise().resolves([{hdc: '1'}]);
            hdcrecallStub = sandbox.stub().returnsPromise().resolves([{recall: '1'}]);
            createPdfStub = sandbox.stub();
        });

        const getPdf = ({subject = subjectStub,
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
                    'getMovements': movements,
                    'getAliases': aliases,
                    'getAddresses': addresses,
                    'getOffences': offences,
                    'getHDCInfo': hdcinfo,
                    'getHDCRecall': hdcrecall
                },
                './helpers/pdfHelpers': {
                    'createPdf': createPdf
                }
            }).getPdf;
        };

        it('should redirect to print form if nothing in query string', () => {
            reqMock = {
                query: {}
            };
            getPdf()(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.have.been.calledWith('print', {content: content.view.print});
        });

        it('should get the data for the fields in the query string', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['summary', 'addresses']}
            };
            getPdf()(reqMock, resMock);
            expect(subjectStub).to.have.callCount(1);
            expect(addressesStub).to.have.callCount(1);
        });

        it('should call createPdf if all data requests resolve successfully', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['summary', 'addresses']}
            };
            return getPdf()(reqMock, resMock).then(() => {
                expect(createPdfStub).to.have.callCount(1);
            });
        });

        it('should pass in the data to createpdf', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['summary', 'addresses']}
            };

            const expectedPrintItems = ['summary', 'addresses'];
            const expectedData = [{
                prisonNumber: '     id1',
                forename: 'Matthew',
                forename2: 'James',
                surname: 'Whitfield',
            }, [{address: '1'}]];
            const expectedName = {
                forename: 'Matthew',
                surname: 'Whitfield',
                prisonNumber: '     id1'
            };

            return getPdf()(reqMock, resMock).then(() => {
                expect(createPdfStub.getCall(0).args[1]).to.eql(expectedPrintItems);
                expect(createPdfStub.getCall(0).args[2]).to.eql(expectedData);
                expect(createPdfStub.getCall(0).args[4]).to.eql(expectedName);
            });
        });

        it('should get name and id details even if summary is not requested', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['offences', 'addresses']}
            };

            const expectedPrintItems = ['offences', 'addresses'];
            const expectedData = [[{offence: '1'}], [{address: '1'}]];
            const expectedName = {
                forename: 'Matthew',
                surname: 'Whitfield',
                prisonNumber: '     id1'
            };

            return getPdf()(reqMock, resMock).then(() => {
                expect(createPdfStub.getCall(0).args[1]).to.eql(expectedPrintItems);
                expect(createPdfStub.getCall(0).args[2]).to.eql(expectedData);
                expect(createPdfStub.getCall(0).args[4]).to.eql(expectedName);
            });
        });

        it('should not call createPdf if any data requests resolve unsuccessfully', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['summary', 'addresses']}
            };

            const subjectStub = sandbox.stub().returnsPromise().rejects();
            return getPdf({subject: subjectStub})(reqMock, resMock).then(() => {
                expect(createPdfStub).to.have.callCount(0);
            });
        });

        it('should redirect to print page if any data requests resolve unsuccessfully', () => {
            reqMock = {
                query: {prisonNo: '12345678', fields: ['summary', 'addresses']}
            };

            const subjectStub = sandbox.stub().returnsPromise().rejects();
            return getPdf({subject: subjectStub})(reqMock, resMock).then(() => {
                expect(resMock.redirect).to.have.callCount(1);
                expect(resMock.redirect).to.have.been.calledWith('/print?prisonNo=12345678');
            });
        });
    });

});
