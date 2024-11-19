const gradeController = require('./gradeController');
const { instructorView, studentView } = require('../views/templates');

class LTIController {
  async handleLaunch(token, req, res) {
    try {
      // Validate message hint if present
      const messageHint = req.query.lti_message_hint;
      if (messageHint) {
        // Store the message hint for validation
        req.session.messageHint = messageHint;
      }

      // Parse token
      const roles = token.userRoles;
      const email = token.userEmail;
      const userName = token.name;
      const contextTitle = token.platformContext.context.title || 'this course';
      const activityId = token.platformContext.contextId;

      // Validate required launch parameters
      if (!roles || !activityId) {
        throw new Error('Missing required launch parameters');
      }

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
      res.status(400).json({
        status: 'bad_request',
        message: err.message || 'Invalid launch request'
      });
    }
  }

  // Add method to validate message hint
  async validateMessageHint(req, res, next) {
    const storedHint = req.session.messageHint;
    const receivedHint = req.query.lti_message_hint;

    if (!storedHint || !receivedHint || storedHint !== receivedHint) {
      return res.status(400).json({
        status: 'bad_request',
        message: 'Invalid lti_message_hint'
      });
    }

    next();
  }
}

module.exports = new LTIController();
