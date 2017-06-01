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

        it('should redirect to the search page with the appropriate query string', () => {

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
                query: {prisonNo: '12345678', fields: ['summary', 'custodyOffences']}
            };

            const expectedUrl = '/print/pdf?prisonNo=12345678&fields=summary&fields=custodyOffences';

            postPrintForm(reqMock, resMock);
            expect(resMock.redirect).to.have.callCount(1);
            expect(resMock.redirect).to.have.been.calledWith(expectedUrl);
        });

        it('should return to print form if no items are selected', () => {
            reqMock = {
                body: {printOption: []},
                query: {prisonNo: '12345678', fields: ['summary', 'custodyOffences']}
            };

            postPrintForm(reqMock, resMock);
            expect(resMock.render).to.have.been.calledWith('print', {content: content.view.print});
        });
    });

    describe('getPdf', () => {

        const pipeStub = sandbox.stub();
        const endStub = sandbox.stub();

        function pdfReturn() {
            this.pipe = pipeStub;
            this.fontSize = sandbox.stub().returns({text: sandbox.stub()});
            this.text = sandbox.stub();
            this.moveDown = sandbox.stub();
            this.end = endStub;
        }

        function tableReturns() {
            this.addColumns = sandbox.stub();
            this.addBody = sandbox.stub();
        }

        const getPdfProxy = (pdfKit = pdfReturn, pdfTable = tableReturns) => {
            return proxyquire('../../controllers/printController', {
                'pdfkit': pdfKit,
                'voilab-pdf-table': pdfTable
            }).getPdf;
        };

        it('should redirect to print form if nothing in query string', () => {
            reqMock = {
                query: {}
            };
            getPdf(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.have.been.calledWith('print', {content: content.view.print});
        });

        it('should get the data for the fields in the query string', () => {
            reqMock = {
                query: {0: 'names', 1: 'dob'}
            };

            // use proxyquire to test that appropriate sql is called
        });

        it.skip('should set Content-Type to application/pdf and status 200', () => {

            getPdf(reqMock, resMock);
            expect(resMock.writeHead).to.have.callCount(1);
            expect(resMock.writeHead).to.have.been.calledWith(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename=test.pdf'
            });
        });

        it('should pipe doc to res', () => {
            getPdfProxy()(reqMock, resMock);
            expect(pipeStub).to.have.callCount(1);
            expect(pipeStub).to.have.been.calledWith(resMock);
        });

        it('should call end of doc stream', () => {
            getPdfProxy()(reqMock, resMock);
            expect(endStub).to.have.callCount(1);
        });
    });

});
