const styles = {
  base: `
    body { font-family: Arial, sans-serif; margin: 20px; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2 { color: #2c3e50; }
    .config-card { 
      padding: 20px;
      border-radius: 8px;
      background: #f8f9fa;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .url-list {
      background: #e1f5fe;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .url-item {
      margin: 10px 0;
      word-break: break-all;
    }
    code {
      background: #f1f1f1;
      padding: 2px 5px;
      border-radius: 3px;
    }
    .form-group { margin: 15px 0; }
    label { display: block; margin-bottom: 5px; }
    input { width: 100%; padding: 8px; margin: 5px 0; }
    button { 
      background: #007bff; 
      color: white; 
      border: none; 
      padding: 10px 20px;
      border-radius: 4px; 
      cursor: pointer; 
    }
    button:hover { background: #0056b3; }
    #result { 
      margin-top: 20px; 
      padding: 10px; 
      border-radius: 4px; 
      display: none;
    }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
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
    .stats { 
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
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
  `
};

function configView({ baseUrl, dbStatus, ltiKey, encryptionKey }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>LTI Configuration</title>
      <style>${styles.base}</style>
    </head>
    <body>
      <h1>LTI Tool Configuration</h1>
      
      <div class="config-card">
        <h2>Important URLs</h2>
        <div class="url-list">
          <div class="url-item"><strong>Launch URL:</strong> <code>${baseUrl}/lti</code></div>
          <div class="url-item"><strong>Login URL:</strong> <code>${baseUrl}/lti/login</code></div>
          <div class="url-item"><strong>Public JWK URL:</strong> <code>${baseUrl}/lti/keys</code></div>
          <div class="url-item"><strong>Webhook URL:</strong> <code>${baseUrl}/webhook/grade</code></div>
        </div>
      </div>

      <div class="config-card">
        <h2>Canvas Configuration</h2>
        <p>In Canvas Developer Keys, set the following:</p>
        <ul>
          <li>Target Link URI: <code>${baseUrl}/lti</code></li>
          <li>OpenID Connect Initiation URL: <code>${baseUrl}/lti/login</code></li>
          <li>JWK Method: Public JWK URL</li>
          <li>Public JWK URL: <code>${baseUrl}/lti/keys</code></li>
        </ul>
      </div>

      <div class="config-card">
        <h2>Platform Registration</h2>
        <form id="platformForm">
          <div class="form-group">
            <label>Platform URL:</label>
            <input type="url" id="url" value="https://canvas.instructure.com" required>
          </div>
          <div class="form-group">
            <label>Platform Name:</label>
            <input type="text" id="name" value="Canvas" required>
          </div>
          <div class="form-group">
            <label>Client ID (from Canvas Developer Key):</label>
            <input type="text" id="clientId" required>
          </div>
          <div class="form-group">
            <label>Authentication Endpoint:</label>
            <input type="url" id="authenticationEndpoint" 
              value="https://canvas.instructure.com/api/lti/authorize_redirect" required>
          </div>
          <div class="form-group">
            <label>Access Token Endpoint:</label>
            <input type="url" id="accesstokenEndpoint" 
              value="https://canvas.instructure.com/login/oauth2/token" required>
          </div>
          <div class="form-group">
            <label>JWK Set URL:</label>
            <input type="url" id="authConfigUrl" 
              value="https://canvas.instructure.com/api/lti/security/jwks" required>
          </div>
          <button type="submit">Register Platform</button>
        </form>
        <div id="result"></div>
      </div>

      <div class="config-card">
        <h2>Environment Check</h2>
        <ul>
          <li>MongoDB Connection: ${dbStatus ? '✅ Connected' : '❌ Not Connected'}</li>
          <li>LTI Key: ${ltiKey ? '✅ Set' : '❌ Missing'}</li>
          <li>Encryption Key: ${encryptionKey ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>

      <script>
        document.getElementById('platformForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const result = document.getElementById('result');
          result.style.display = 'block';
          try {
            const response = await fetch('/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: document.getElementById('url').value,
                name: document.getElementById('name').value,
                clientId: document.getElementById('clientId').value,
                authenticationEndpoint: document.getElementById('authenticationEndpoint').value,
                accesstokenEndpoint: document.getElementById('accesstokenEndpoint').value,
                authConfigUrl: document.getElementById('authConfigUrl').value
              })
            });
            const data = await response.json();
            if (response.ok) {
              result.className = 'success';
              result.textContent = 'Platform registered successfully!';
            } else {
              result.className = 'error';
              result.textContent = 'Error: ' + (data.error || 'Unknown error');
            }
          } catch (err) {
            result.className = 'error';
            result.textContent = 'Error: ' + err.message;
          }
        });
      </script>
    </body>
    </html>
  `;
}

function gradeTestView() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Grade Submission</title>
      <style>${styles.base}</style>
    </head>
    <body>
      <h1>Test Grade Submission</h1>
      <form id="gradeForm">
        <div class="form-group">
          <label for="email">Student Email:</label>
          <input type="email" id="email" required>
        </div>
        <div class="form-group">
          <label for="grade">Grade (0-100):</label>
          <input type="number" id="grade" min="0" max="100" required>
        </div>
        <div class="form-group">
          <label for="activityId">Activity ID:</label>
          <input type="text" id="activityId" required>
        </div>
        <button type="submit">Submit Grade</button>
      </form>
      <div id="result"></div>

      <script>
        document.getElementById('gradeForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const result = document.getElementById('result');
          try {
            const response = await fetch('/webhook/grade', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: document.getElementById('email').value,
                grade: parseInt(document.getElementById('grade').value),
                activityId: document.getElementById('activityId').value
              })
            });
            const data = await response.json();
            if (response.ok) {
              result.className = 'success';
              result.textContent = 'Grade submitted successfully!';
            } else {
              result.className = 'error';
              result.textContent = 'Error: ' + (data.error || 'Unknown error');
            }
          } catch (err) {
            result.className = 'error';
            result.textContent = 'Error: ' + err.message;
          }
        });
      </script>
    </body>
    </html>
  `;
}

function instructorView({ contextTitle, submissions }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lab Activity Submissions</title>
      <style>${styles.base}</style>
    </head>
    <body>
      <h1>Lab Activity Submissions for ${contextTitle}</h1>
      <div class="stats">
        <p>Total Submissions: ${submissions.length}</p>
        <p>Average Grade: ${submissions.length ? 
          (submissions.reduce((acc, sub) => acc + sub.grade, 0) / submissions.length).toFixed(2) : 'N/A'}</p>
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
  `;
}

function studentView({ userName, email, contextTitle, submissions, latestSubmission }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Lab Activity Status</title>
      <style>${styles.base}</style>
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
  `;
}

module.exports = {
  configView,
  gradeTestView,
  instructorView,
  studentView
};
