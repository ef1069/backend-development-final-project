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