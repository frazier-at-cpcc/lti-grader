const database = require('../config/database');
const ltiProvider = require('../config/lti');

class GradeController {
  async submitGrade(req, res) {
    try {
      const { email, grade, activityId } = req.body;
      
      if (!email || !grade || !activityId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const db = database.getDb();
      const grades = db.collection('grades');

      // Save grade to database
      await grades.insertOne({
        email,
        grade,
        activityId,
        submittedAt: new Date()
      });

      // Get LTI lineitem and submit grade
      const lineitem = await ltiProvider.getLineItems(activityId);
      if (lineitem && lineitem[0]) {
        await ltiProvider.submitGrade(
          activityId,
          lineitem[0].id,
          grade,
          email,
          'Grade from lab environment'
        );
      }

      res.json({ success: true });
    } catch (err) {
      console.error('Error processing grade:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStudentGrades(email, activityId) {
    const db = database.getDb();
    const grades = db.collection('grades');
    return await grades.find({ email, activityId }).toArray();
  }

  async getAllGrades(activityId) {
    const db = database.getDb();
    const grades = db.collection('grades');
    return await grades.find({ activityId }).toArray();
  }
}

module.exports = new GradeController();
