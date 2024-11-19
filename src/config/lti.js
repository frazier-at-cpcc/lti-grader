const lti = require('ltijs').Provider;
const path = require('path');

class LTIProvider {
  constructor() {
    this.provider = lti;
  }

  setup() {
    this.provider.setup(
      process.env.LTI_KEY,
      {
        url: process.env.MONGODB_URI,
      },
      {
        staticPath: path.join(__dirname, '../../public'),
        cookies: {
          secure: false,
          sameSite: ''
        },
        encryptionKey: process.env.ENCRYPTION_KEY,
        // Add development platform registration for Canvas
        registerPlatform: {
          url: 'https://canvas.instructure.com',
          name: 'Canvas',
          clientId: process.env.LTI_KEY,
          authenticationEndpoint: 'https://canvas.instructure.com/api/lti/authorize_redirect',
          accesstokenEndpoint: 'https://canvas.instructure.com/login/oauth2/token',
          authConfig: {
            method: 'JWK_SET',
            key: 'https://canvas.instructure.com/api/lti/security/jwks'
          }
        }
      }
    );

    return this.provider;
  }

  async registerPlatform(platformConfig) {
    return await this.provider.registerPlatform(platformConfig);
  }

  async submitGrade(activityId, lineItemId, grade, userId, comment) {
    return await this.provider.Grade.submitScore(
      activityId,
      lineItemId,
      grade,
      userId,
      comment
    );
  }

  async getLineItems(activityId) {
    return await this.provider.Grade.getLineItems(activityId);
  }

  getApp() {
    return this.provider.app;
  }
}

module.exports = new LTIProvider();
