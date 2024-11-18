require('dotenv').config();
const express = require('express');
const path = require('path');
const lti = require('ltijs').Provider;
const Database = require('mongodb').MongoClient;

// Initialize LTI provider
lti.setup(process.env.LTI_KEY,
  {
    url: process.env.MONGODB_URI,
  },
  {
    staticPath: path.join(__dirname, 'public'),
    cookies: {
      secure: false,
      sameSite: ''
    },
    encryptionKey: process.env.ENCRYPTION_KEY // Add encryption key from environment variable
  }
);

// Connect to MongoDB
async function connectDB() {
  try {
    const client = await Database.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    return client.db();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

// Setup LTI routes and middleware
async function setup() {
  // Create express app
  const app = express();

  // Setup ltijs
  await lti.deploy({ port: process.env.PORT });

  // Connect db
  const db = await connectDB();

  // Setup grades collection
  const grades = db.collection('grades');
  await grades.createIndex({ email: 1, activityId: 1 });

  // LTI Launch
  lti.onConnect((token, req, res) => {
    // Parse token
    const roles = token.userRoles;
    const email = token.userEmail;
    const userName = token.name;
    const contextTitle = token.platformContext.context.title || 'this course';
    
    if (roles.includes('instructor')) {
      // Instructor view - show all submissions
      grades.find({ activityId: token.platformContext.contextId }).toArray()
        .then(submissions => {
          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Lab Activity Submissions</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2c3e50; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f5f6fa; }
                tr:hover { background-color: #f5f5f5; }
                .stats { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
              </style>
            </head>
            <body>
              <h1>Lab Activity Submissions for ${contextTitle}</h1>
              <div class="stats">
                <p>Total Submissions: ${submissions.length}</p>
                <p>Average Grade: ${submissions.length ? (submissions.reduce((acc, sub) => acc + sub.grade, 0) / submissions.length).toFixed(2) : 'N/A'}</p>
              </div>
              <table>
                <tr>
                  <th>Student Email</th>
                  <th>Grade</th>
                  <th>Submission Date</th>
                </tr>
                ${submissions.map(sub => `
                  <tr>
                    <td>${sub.email}</td>
                    <td>${sub.grade}</td>
                    <td>${new Date(sub.submittedAt).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </table>
            </body>
            </html>
          `);
        });
    } else {
      // Student view - show their submissions and lab status
      grades.find({ email, activityId: token.platformContext.contextId }).toArray()
        .then(submissions => {
          const latestSubmission = submissions.length > 0 ? 
            submissions.reduce((latest, current) => 
              new Date(current.submittedAt) > new Date(latest.submittedAt) ? current : latest
            ) : null;

          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Lab Activity Status</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1, h2 { color: #2c3e50; }
                .status-card { 
                  padding: 20px;
                  border-radius: 8px;
                  background: #f8f9fa;
                  margin: 20px 0;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .grade { 
                  font-size: 24px;
                  font-weight: bold;
                  color: #2c3e50;
                  margin: 10px 0;
                }
                .info { 
                  color: #666;
                  line-height: 1.6;
                }
                .instructions {
                  background: #e1f5fe;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .history {
                  margin-top: 30px;
                }
                table { 
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 15px;
                }
                th, td { 
                  padding: 12px;
                  text-align: left;
                  border-bottom: 1px solid #ddd;
                }
                th { background-color: #f5f6fa; }
                .no-submission {
                  text-align: center;
                  padding: 40px;
                  background: #f8f9fa;
                  border-radius: 8px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <h1>Lab Activity Status</h1>
              
              <div class="status-card">
                <h2>Welcome, ${userName || email}</h2>
                <p class="info">Course: ${contextTitle}</p>
                ${latestSubmission ? `
                  <p>Latest Submission Status:</p>
                  <div class="grade">Grade: ${latestSubmission.grade}%</div>
                  <p class="info">Submitted: ${new Date(latestSubmission.submittedAt).toLocaleString()}</p>
                ` : `
                  <p class="info">No submission received yet.</p>
                `}
              </div>

              <div class="instructions">
                <h2>How It Works</h2>
                <p>1. Complete your lab work in the provided lab environment</p>
                <p>2. Your work will be automatically graded and submitted</p>
                <p>3. Grades will appear here and in your course gradebook</p>
                <p>4. You can make multiple submissions if needed</p>
              </div>

              ${submissions.length > 0 ? `
                <div class="history">
                  <h2>Submission History</h2>
                  <table>
                    <tr>
                      <th>Grade</th>
                      <th>Submission Date</th>
                    </tr>
                    ${submissions.map(sub => `
                      <tr>
                        <td>${sub.grade}%</td>
                        <td>${new Date(sub.submittedAt).toLocaleString()}</td>
                      </tr>
                    `).join('')}
                  </table>
                </div>
              ` : ''}
            </body>
            </html>
          `);
        });
    }
  });

  // Webhook endpoint for receiving grades
  app.post('/webhook/grade', express.json(), async (req, res) => {
    try {
      const { email, grade, activityId } = req.body;
      
      if (!email || !grade || !activityId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Save grade to database
      await grades.insertOne({
        email,
        grade,
        activityId,
        submittedAt: new Date()
      });

      // Get LTI lineitem and submit grade
      const lineitem = await lti.Grade.getLineItems(activityId);
      if (lineitem && lineitem[0]) {
        await lti.Grade.submitScore(
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
  });

  console.log('LTI Provider running on port:', process.env.PORT);
}

setup().catch(console.error);
