const gradeController = require('./gradeController');
const { instructorView, studentView } = require('../views/templates');

class LTIController {
  async handleLaunch(token, req, res) {
    try {
      // Parse token
      const roles = token.userRoles;
      const email = token.userEmail;
      const userName = token.name;
      const contextTitle = token.platformContext.context.title || 'this course';
      const activityId = token.platformContext.contextId;

      if (roles.includes('instructor')) {
        // Instructor view - show all submissions
        const submissions = await gradeController.getAllGrades(activityId);
        res.send(instructorView({
          contextTitle,
          submissions
        }));
      } else {
        // Student view - show their submissions and lab status
        const submissions = await gradeController.getStudentGrades(email, activityId);
        const latestSubmission = submissions.length > 0 ? 
          submissions.reduce((latest, current) => 
            new Date(current.submittedAt) > new Date(latest.submittedAt) ? current : latest
          ) : null;

        res.send(studentView({
          userName,
          email,
          contextTitle,
          submissions,
          latestSubmission
        }));
      }
    } catch (err) {
      console.error('Error handling LTI launch:', err);
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = new LTIController();
