# backend-development-final-project
A REST API for managing game nights and other events, built with Node.js, Express, and SQLite

## Features
- User registration (authentication in development)
- CRUD endpoints
- Event planning and organization
- SQLite database and Sequelize ORM

## API Endpoints

### Authentication
- POST /api/register - Register a new user
- POST /api/login - Login user

### Events
- GET /api/events - Show all events
- POST /api/events - Create and event
- GET /api/events/:id - Get a single event
- PUT /api/events/:id - Update event

### Games
- GET /api/games - Show all games
- GET /api/games/:id - Get a single game

### Utility
- GET /health - Health check
- GET / - General API information

## Local Development
1. Install dependencies: 
'''bash 
npm install
'''
2. Seed the database with sample data:
'''bash
npm run seed
'''
3. Start the server:
'''bash
npm run start
'''
4. API will be available at 'http://localhost:3000'

### Sample users
If you run the seed screen to fill with example data, this is the user information: 
- **john@example.com / password123
- **jane@example.com / password123
- **mike@example.com / password123

### Testing
Use the following sample requests to test the API:

**Register a user:**

POST /api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}

**Login:**

POST /api/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}

**Create an event**

POST /api/events
Content-Type: application/json

{
    "title": "Game Night",
    "description": "game night information",
    "date":2026,
    "location": "address"
}


### Database
This API uses SQLite, events.db will be created automatically after running the necessary local development code. 

### Environment Variables
-'NODE_ENV' - Environment
-'PORT' - Server port (3000)
-'DB_NAME' - Database file name

### Deployment
Final deployment still in development, not yet ready for cloud for security reasons.