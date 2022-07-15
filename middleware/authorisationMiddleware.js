const jwtDecode = require('jwt-decode');
const logger = require('../log');

const HPA_ROLE = 'ROLE_HPA_USER';

module.exports = function authorisationMiddleware(req, res, next) {
  if (req.user && req.user.token) {
    const {authorities: roles = []} = jwtDecode(req.user.token);
    if (!roles.includes(HPA_ROLE)) {
      logger.error('User is not authorised to access this');
      return res.redirect('/authError');
    }
    return next();
  }
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
};
