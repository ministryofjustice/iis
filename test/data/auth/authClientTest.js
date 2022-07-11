const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const nock = require('nock');
const config = require('../../../server/config');
const expect = chai.expect;
const sinon = require('sinon');
const getUserDetails = require('../../../data/auth/authClient');
const uuid = require('uuid');

chai.use(chaiAsPromised)

describe('getUserDetails', () => {
  let fakeApi

  before(() => {
    fakeApi = nock(config.sso.TOKEN_HOST)
    sinon.stub(uuid, 'v1', function () {return '00000000-0000-0000-0000-000000000000'})
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('should return user details with email address', async () => {
      fakeApi.get(config.sso.USER_DETAILS_PATH).reply(200, {userId: '123', name: 'Joe Bloggs'})
      fakeApi.get(config.sso.USER_EMAIL_PATH).reply(200, {email: "abc@def.com"})

      await getUserDetails('')
          .then(function(details) {
              expect(details).to.eql({
                  id: '123',
                  email: 'abc@def.com',
                  firstName: 'Joe',
                  lastName: 'Bloggs',
                  logoutLink: 'http://localhost:8080/auth/sign-out',
                  profileLink: 'http://localhost:8080/auth/account-details',
                  sessionTag: '00000000-0000-0000-0000-000000000000'
              })
          })
  });

  it('should error if user details fails', async () => {
      fakeApi.get(config.sso.USER_DETAILS_PATH).reply(500)
      fakeApi.get(config.sso.USER_EMAIL_PATH).reply(200, {email: "abc@def.com"})

      await expect(getUserDetails('')).to.eventually.be.rejectedWith('500 - undefined')
  });

  it('should error if email address fails', async () => {
      fakeApi.get(config.sso.USER_DETAILS_PATH).reply(200, {userId: '123', name: 'Joe Bloggs'})
      fakeApi.get(config.sso.USER_EMAIL_PATH).reply(500)

      await expect(getUserDetails('')).to.eventually.be.rejectedWith('500 - undefined')
  });
});
