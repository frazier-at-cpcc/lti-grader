const express = require('express');
const configController = require('../controllers/configController');
const gradeController = require('../controllers/gradeController');
const ltiProvider = require('../config/lti');

const router = express.Router();

// Public routes
router.get('/config', configController.showConfig);

// Dynamic registration route - use ltijs's built-in registration middleware
router.post('/register', 
  (req, res, next) => ltiProvider.provider.DynamicRegistration.registerPlatformMiddleware(req, res, next),
  configController.registerPlatform
);

router.get('/test/grade', configController.showGradeTest);
router.post('/webhook/grade', gradeController.submitGrade);

module.exports = router;
