const chai = require('chai');
const expect = chai.expect;
const generateOauthClientToken = require('../../server/clientCredentials');

describe('generateOauthClientToken', () => {
  it('Token can be generated', () => {
    expect(generateOauthClientToken('bob', 'password1')).to.eql('Basic Ym9iOnBhc3N3b3JkMQ==')
  })

  it('Token can be generated with special characters', () => {
    const value = generateOauthClientToken('bob', "p@'s&sw/o$+ rd1")
    const decoded = Buffer.from(value.substring(6), 'base64').toString('utf-8')

    expect(decoded).to.eql("bob:p@'s&sw/o$+ rd1")
  })
})
