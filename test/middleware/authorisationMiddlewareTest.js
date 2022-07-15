const chai = require('chai');
const expect = chai.expect;
const jwt = require('jsonwebtoken')
const authorisationMiddleware = require('../../middleware/authorisationMiddleware')

function createToken(authorities) {
  const payload = {
    user_name: 'HPA_USER',
    scope: ['read'],
    auth_source: 'nomis',
    authorities,
    jti: 'a610a10-cca6-41db-985f-e87efb303aaf',
    client_id: 'hpa-client',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

function createReqWithToken({ authorities }) {
    return { user: { token: createToken(authorities) } }
}

describe('authorisationMiddleware', () => {
  const res = { redirect: (redirectUrl) => { return redirectUrl } }
  const next = () => {}

  it('should redirect when user has no roles', () => {
    const req = createReqWithToken({ authorities: [] })
    const authorisationResponse = authorisationMiddleware(req, res, next)

    expect(authorisationResponse).to.eq('/authError')
  })

  it('should redirect when user has no HPA role', () => {
    const req = createReqWithToken({ authorities: ['NOT_A_HPA_ROLE'] })
    const authorisationResponse = authorisationMiddleware(req, res, next)

    expect(authorisationResponse).to.eq('/authError')
  })

  it('should return next when user has HPA role', () => {
    const req = createReqWithToken({ authorities: ['ROLE_HPA_USER', 'ROLE_SOMETHING_ELSE'] })
    const authorisationResponse = authorisationMiddleware(req, res, next)

    expect(authorisationResponse).to.eq(next())
  })
})
