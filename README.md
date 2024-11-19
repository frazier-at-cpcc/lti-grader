# LTI Grader Application

This is an LTI (Learning Tools Interoperability) application for handling lab environment grades. It provides integration between learning platforms and lab environments, automatically processing and recording student grades.

## Quick Start for Canvas Integration

1. Access the configuration page at `/config` on your deployed instance
2. Copy the displayed URLs for Canvas configuration
3. Create a Developer Key in Canvas:
   - Go to Admin > Developer Keys
   - Click "+ Developer Key" > "LTI Key"
   - Paste the URLs from the config page
   - Save and copy the Client ID
4. Return to the config page and register Canvas:
   - Use the Platform Registration form
   - Paste the Client ID from Canvas
   - Click "Register Platform"
5. Add the tool to your course in Canvas

## Environment Variables

The following environment variables are required:

```
PORT=3000
MONGODB_URI=mongodb://your-mongodb-uri
LTI_KEY=your-lti-key  # Use the Client ID from Canvas
ENCRYPTION_KEY=your-encryption-key  # Required for LTI provider security
```

## Configuration Endpoints

### `/config`
Provides a web interface for:
- Viewing all required URLs for Canvas setup
- Checking environment status
- Registering Canvas as a platform
- Testing the configuration

### `/test/grade`
Provides a web interface for:
- Testing grade submissions
- Verifying grade passback
- Debugging integration issues

## Canvas Integration Details

### Step 1: Configure the Developer Key

1. In Canvas, go to Admin > Developer Keys
2. Click "+ Developer Key" > "LTI Key"
3. Configure the following settings:
   - **Key Name**: LTI Grader (or your preferred name)
   - **Owner Email**: Your admin email
   - **Redirect URIs**: Copy from `/config` page
   - **Target Link URI**: Copy from `/config` page
   - **OpenID Connect Initiation URL**: Copy from `/config` page
   - **JWK Method**: Public JWK URL
   - **Public JWK URL**: Copy from `/config` page
   - **LTI Advantage Services**:
     - Enable "Can create and view assignment data in the gradebook"
     - Enable "Can view submission data"
     - Enable "Can create and update submission results"
     - Enable "Can view assignment data"

### Step 2: Register the Platform

1. Visit the `/config` page on your deployed instance
2. Locate the "Platform Registration" section
3. The form will be pre-filled with Canvas URLs
4. Enter the Client ID from your Developer Key
5. Click "Register Platform"

### Step 3: Add to Course

1. In your Canvas course, go to Settings > Apps
2. Click "+ App"
3. Select "By Client ID"
4. Enter:
   - **Client ID**: From Developer Key
   - **Name**: LTI Grader (or your preferred name)
5. Click "Submit"

### Step 4: Create Assignment

1. Create a new assignment
2. Select "External Tool" as submission type
3. Click "Find" and select your tool
4. Save the assignment

## Docker Deployment

The application is containerized and automatically built using GitHub Actions.

### Running with Docker

```bash
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

## Development

To run locally:

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev
```

## Testing the Integration

1. After setup, verify the integration:
   - Visit `/config` to check environment status
   - Use `/test/grade` to submit test grades
   - Launch from a Canvas assignment
   - Check grades appear in Canvas

2. Common test scenarios:
   - Student submission flow
   - Instructor grade viewing
   - Multiple submissions
   - Grade passback to Canvas

## Troubleshooting

### Common Issues

1. **UNREGISTERED_PLATFORM Error**
   - Visit `/config` and use the Platform Registration form
   - Verify Client ID matches Canvas Developer Key
   - Check platform URLs are correct

2. **Launch Fails**
   - Verify URLs in Canvas match `/config` page
   - Check LTI_KEY matches Client ID
   - Ensure platform is registered

3. **Grades Not Appearing**
   - Verify assignment is published
   - Check grade submission using `/test/grade`
   - Ensure LTI services are enabled in Developer Key

4. **MongoDB Connection Issues**
   - Check MONGODB_URI is correct
   - Verify database credentials
   - Ensure database is accessible

For additional help, check the application logs or contact support.
