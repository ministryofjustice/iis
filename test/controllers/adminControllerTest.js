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

describe('adminController', () => {
    let reqMock;
    let resMock;
    let getActionsStub;
    let printActionsStub;

    beforeEach(() => {
        reqMock = {
            user: {
                email: 'x@y.com',
            }
        };
        resMock = {render: sandbox.spy(), redirect: sandbox.spy(), status: sandbox.spy()};
        getActionsStub = sandbox.stub().returnsPromise().resolves(['actions']);
        printActionsStub = sandbox.stub();
    });

    afterEach(() => {
        sandbox.reset();
    });

    describe('getIndex', () => {

        const getIndexProxy = (getActions = getActionsStub) => {
            return proxyquire('../../controllers/adminController', {
                '../data/audit': {
                    'getLatestActions': getActions
                }
            }).getIndex;
        };

        it('should call getLatestActions', () => {
            getIndexProxy()(reqMock, resMock);
            expect(getActionsStub).to.have.callCount(1);
        });

        it('should render admin view if successful', () => {
            getIndexProxy()(reqMock, resMock);
            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.be.calledWith('admin', {
                content: {title: 'Admin'},
                latestAccess: ['actions']
            });
        });

        it('should render admin view with error if unsuccessful', () => {
            const getActions = sandbox.stub().returnsPromise().rejects({message: 'oops'});

            getIndexProxy(getActions)(reqMock, resMock);

            expect(resMock.render).to.have.callCount(1);
            expect(resMock.render).to.be.calledWith('admin', {
                content: {title: 'Admin'},
                latestAccess: [],
                err: {
                    title: 'An error occurred retrieving audit data',
                    desc: 'Please reload the page to try again'
                }
            });
        });
    });

    describe('printItems', () => {
        const printItemsProxy = (getActions = getActionsStub, printActions = printActionsStub) => {
            return proxyquire('../../controllers/adminController', {
                '../data/audit': {
                    'getLatestActions': getActions
                },
                './helpers/pdfHelpers': {
                    'createPdf': printActions,
                    'twoColumnTable' : '2ColumnStub'
                }
            }).printItems;
        };

        it('should call getLatestActions', () => {
            printItemsProxy()(reqMock, resMock);
            expect(getActionsStub).to.have.callCount(1);
        });

        it('should print actions if successful', () => {
            printItemsProxy()(reqMock, resMock);
            expect(printActionsStub).to.have.callCount(1);
        });

        it('should pass appropriate data to printItems', () => {
            printItemsProxy()(reqMock, resMock);

            const availablePrintOptions = {
                latestAccess: {
                    title: 'Latest action per user',
                    addContent: '2ColumnStub',
                    getData: getActionsStub
                }
            };

            expect(printActionsStub).to.be.calledWith(resMock, ['latestAccess'], [['actions']], availablePrintOptions);
        });

    });

});
