# LTI Grader Application

This is an LTI (Learning Tools Interoperability) application for handling lab environment grades. It provides integration between learning platforms and lab environments, automatically processing and recording student grades.

## Environment Variables

The following environment variables are required:

```
PORT=3000
MONGODB_URI=mongodb://your-mongodb-uri
LTI_KEY=your-lti-key
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
version: '3.8'
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

- LTI 1.3 Integration
- Automatic grade processing
- Instructor dashboard for viewing all submissions
- Student view for individual grade history
- Webhook endpoint for receiving grades
- MongoDB storage for grade persistence

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
