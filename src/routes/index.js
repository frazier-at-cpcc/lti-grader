const express = require('express');
const configController = require('../controllers/configController');
const gradeController = require('../controllers/gradeController');

const router = express.Router();

// Public routes
router.get('/config', configController.showConfig);
router.post('/register', configController.registerPlatform);
router.get('/test/grade', configController.showGradeTest);
router.post('/webhook/grade', gradeController.submitGrade);

module.exports = router;
