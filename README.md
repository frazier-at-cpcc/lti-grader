# LTI Grader Application

This is an LTI (Learning Tools Interoperability) application for handling lab environment grades. It provides integration between learning platforms and lab environments, automatically processing and recording student grades.

## Canvas Integration Guide

### Step 1: Configure the LTI Tool in Canvas

1. In Canvas, go to Admin > Site Admin > Developer Keys
2. Click the "+ Developer Key" button and select "LTI Key"
3. Configure the following settings:
   - **Key Name**: LTI Grader (or your preferred name)
   - **Owner Email**: Your admin email
   - **Redirect URIs**: 
     ```
     https://your-domain/login
     https://your-domain/
     ```
   - **Target Link URI**: `https://your-domain/`
   - **OpenID Connect Initiation URL**: `https://your-domain/login`
   - **JWK Method**: Public JWK URL
   - **Public JWK URL**: `https://your-domain/keys`
   - **LTI Advantage Services**:
     - Enable "Can create and view assignment data in the gradebook"
     - Enable "Can view submission data"
     - Enable "Can create and update submission results"
     - Enable "Can view assignment data"

4. Save the changes and make note of the **Client ID** and **Client Secret**

### Step 2: Add the Tool to Your Course

1. In your Canvas course, go to Settings > Apps
2. Click the "+ App" button
3. Select "By Client ID" from the Configuration Type dropdown
4. Enter the following:
   - **Client ID**: The ID from Step 1
   - **Name**: LTI Grader (or your preferred name)
5. Click "Submit"

### Step 3: Create an Assignment

1. Create a new assignment in your course
2. In the submission type, select "External Tool"
3. Click "Find" and select the LTI Grader tool
4. Set the points possible and other assignment settings
5. Save the assignment

### Troubleshooting

- **401 Unauthorized**: Verify your LTI_KEY and ENCRYPTION_KEY environment variables
- **Launch fails**: Check that your redirect URIs are correctly configured
- **Grades not appearing**: Ensure the assignment is published and the tool has grade passback permissions

## Environment Variables

The following environment variables are required:

```
PORT=3000
MONGODB_URI=mongodb://your-mongodb-uri
LTI_KEY=your-lti-key  # This should match the Client ID from Canvas
ENCRYPTION_KEY=your-encryption-key  # Required for LTI provider security
```

## Docker Deployment

The application is containerized and automatically built using GitHub Actions. The container image is published to Docker Hub.

### Running with Docker

```bash
# Pull the latest image
docker pull [dockerhub-username]/lti-grader:latest

# Run the container
docker run -d \
  -p 3000:3000 \
  -e PORT=3000 \
  -e MONGODB_URI=your-mongodb-uri \
  -e LTI_KEY=your-lti-key \
  -e ENCRYPTION_KEY=your-encryption-key \
  [dockerhub-username]/lti-grader:latest
```

### Docker Compose Example

```yaml
services:
  lti-grader:
    image: [dockerhub-username]/lti-grader:latest
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - MONGODB_URI=your-mongodb-uri
      - LTI_KEY=your-lti-key
      - ENCRYPTION_KEY=your-encryption-key
```

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment:

1. On push to the main branch, the workflow automatically:
   - Builds the Docker image
   - Pushes it to Docker Hub
   - Tags it with both the git SHA and 'latest'

2. Required GitHub Secrets:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token (create at https://hub.docker.com/settings/security)

## Features

- LTI 1.3 Integration with Canvas
- Automatic grade processing and passback
- Instructor dashboard for viewing all submissions
- Student view for individual grade history
- Webhook endpoint for receiving grades
- MongoDB storage for grade persistence
- Secure authentication and data handling

## API Endpoints

### Grade Webhook
```
POST /webhook/grade
Content-Type: application/json

{
  "email": "student@example.com",
  "grade": 100,
  "activityId": "course-123"
}
```

### LTI Endpoints
```
GET /login - LTI login initiation
GET /keys - JWK keyset
POST / - LTI launch
POST /webhook/grade - Grade submission
```

## Development

To run locally without Docker:

```bash
# Install dependencies
npm install

# Start the server
npm start

# Development mode with hot reload
npm run dev
```

Make sure to set up all required environment variables in a .env file for local development:

```env
PORT=3000
MONGODB_URI=your-mongodb-uri
LTI_KEY=your-lti-key
ENCRYPTION_KEY=your-encryption-key
```

## Testing the Integration

1. After setting up the tool in Canvas:
   - Create a test assignment
   - Launch the tool as both instructor and student
   - Submit a test grade using the webhook
   - Verify the grade appears in Canvas gradebook

2. Common test scenarios:
   - Student first launch and grade submission
   - Instructor viewing all submissions
   - Multiple submissions for the same assignment
   - Grade passback to Canvas gradebook
