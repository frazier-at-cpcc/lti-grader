require('dotenv').config();
const express = require('express');
const database = require('./src/config/database');
const ltiProvider = require('./src/config/lti');
const routes = require('./src/routes');
const ltiController = require('./src/controllers/ltiController');

async function bootstrap() {
  try {
    // Create express app
    const app = express();
    app.use(express.json());

    // Initialize LTI provider
    const lti = ltiProvider.setup();

    // Connect to database
    await database.connect();

    // Setup public routes
    app.use('/', routes);

    // Setup LTI routes
    app.use('/lti', lti.app);

    // Setup LTI launch handler
    lti.onConnect(ltiController.handleLaunch);

    // Start server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`
  _   _______ _____      _  _____
 | | |__   __|_   _|    | |/ ____|
 | |    | |    | |      | | (___
 | |    | |    | |  _   | |\\___ \\
 | |____| |   _| |_| |__| |____) |
 |______|_|  |_____|\\____/|_____/

 LTI Provider is listening on port ${port}!

 LTI provider config:
 >App Route: /lti
 >Initiate Login Route: /lti/login
 >Keyset Route: /lti/keys
 >Dynamic Registration Route: /register
      `);
    });
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
}

// Start application
bootstrap().catch(console.error);
