const database = require('../config/database');
const ltiProvider = require('../config/lti');
const { configView, gradeTestView } = require('../views/templates');

class ConfigController {
  async showConfig(req, res) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let dbStatus = false;
    
    try {
      const db = database.getDb();
      dbStatus = !!db;
    } catch (err) {
      console.error('DB connection check failed:', err);
    }

    res.send(configView({
      baseUrl,
      dbStatus,
      ltiKey: process.env.LTI_KEY,
      encryptionKey: process.env.ENCRYPTION_KEY
    }));
  }

  async registerPlatform(req, res) {
    try {
      const { 
        application_type,
        grant_types,
        response_types,
        redirect_uris,
        initiate_login_uri,
        client_name,
        jwks_uri,
        token_endpoint_auth_method,
        scope,
        ...otherConfig 
      } = req.body;

      // Validate required fields for OpenID Connect Dynamic Client Registration
      if (!application_type || !grant_types || !response_types || !redirect_uris || !initiate_login_uri || !client_name || !jwks_uri) {
        return res.status(400).json({ 
          error: 'invalid_client_metadata',
          error_description: 'Missing required registration fields' 
        });
      }

      // Extract platform URL from initiate_login_uri
      const platformUrl = new URL(initiate_login_uri).origin;

      const platformConfig = {
        url: platformUrl,
        name: client_name,
        clientId: process.env.LTI_KEY,
        authenticationEndpoint: `${platformUrl}/api/lti/authorize_redirect`,
        accesstokenEndpoint: `${platformUrl}/login/oauth2/token`,
        authConfig: {
          method: 'JWK_SET',
          key: jwks_uri
        }
      };

      await ltiProvider.registerPlatform(platformConfig);

      // Return the registration response according to OpenID Connect Dynamic Client Registration
      res.json({
        client_id: process.env.LTI_KEY,
        client_secret: process.env.ENCRYPTION_KEY,
        application_type,
        grant_types,
        response_types,
        redirect_uris,
        initiate_login_uri,
        client_name,
        jwks_uri,
        token_endpoint_auth_method,
        scope
      });
    } catch (err) {
      console.error('Platform registration error:', err);
      res.status(500).json({ 
        error: 'invalid_client_metadata',
        error_description: 'Failed to register platform'
      });
    }
  }

  showGradeTest(req, res) {
    res.send(gradeTestView());
  }
}

module.exports = new ConfigController();
