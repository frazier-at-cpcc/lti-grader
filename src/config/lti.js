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
        // Configure dynamic registration properly
        dynReg: {
          url: 'https://canvas.vfraier.net',
          name: 'Canvas',
          clientId: process.env.LTI_KEY,
          authenticationEndpoint: 'https://canvas.vfrazier.net/api/lti/authorize_redirect',
          accesstokenEndpoint: 'https://canvas.vfrazier.net/login/oauth2/token',
          authConfig: {
            method: 'JWK_SET',
            key: 'https://canvas.vfrazier.net/api/lti/security/jwks'
          }
        },
        // Add OIDC message hint validation
        validateMessageHint: true,
        // Add additional security options
        tokenMaxAge: 60,
        devMode: false
      }
    );

    // Enable dynamic registration after setup
    this.provider.DynamicRegistration.enable();

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
