const superagent = require('superagent');
const Agent = require('agentkeepalive');
const HttpsAgent = require('agentkeepalive').HttpsAgent;

const logger = require('../log');

module.exports = function(path, apiConfig, token) {
  const agentConfig = {timeout: apiConfig.timeout};
  const agent = apiConfig.url.startsWith('https') ? new HttpsAgent(agentConfig) : new Agent(agentConfig);

  return superagent.get(`${apiConfig.url}${path}`)
      .agent(agent)
      .retry(2, err => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`);
        return undefined; // retry handler only for logging retries, not to influence retry logic
      })
      .auth(token, {type: 'bearer'})
      .then(result => result.body);
};
