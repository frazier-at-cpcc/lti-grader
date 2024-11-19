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

      // Use the dynamic registration handler from ltijs
      const registration = await ltiProvider.provider.DynamicRegistration.register({
        platformUrl,
        clientName: client_name,
        redirectUris: redirect_uris,
        jwksUrl: jwks_uri,
        initiateLoginUrl: initiate_login_uri,
        tokenEndpointAuthMethod: token_endpoint_auth_method,
        grantTypes: grant_types,
        responseTypes: response_types,
        scope: scope
      });

      // Return the registration response according to OpenID Connect Dynamic Client Registration
      res.json({
        client_id: registration.clientId,
        client_secret: registration.clientSecret || process.env.ENCRYPTION_KEY,
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
        error_description: err.message || 'Failed to register platform'
      });
    }
  }

  showGradeTest(req, res) {
    res.send(gradeTestView());
  }
}

module.exports = new ConfigController();
