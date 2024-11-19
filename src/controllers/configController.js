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
        url, 
        name, 
        clientId, 
        authenticationEndpoint, 
        accesstokenEndpoint, 
        authConfigUrl 
      } = req.body;

      await ltiProvider.registerPlatform({
        url,
        name,
        clientId,
        authenticationEndpoint,
        accesstokenEndpoint,
        authConfig: {
          method: 'JWK_SET',
          key: authConfigUrl
        }
      });

      res.json({ success: true, message: 'Platform registered successfully' });
    } catch (err) {
      console.error('Platform registration error:', err);
      res.status(500).json({ error: 'Failed to register platform' });
    }
  }

  showGradeTest(req, res) {
    res.send(gradeTestView());
  }
}

module.exports = new ConfigController();
