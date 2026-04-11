const express = require('express');
const bcrypt = require('bcryptjs');
const { db, User, Event } = require('./database/setup');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Insert JWT authentication middleware here

// Test databse connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Task API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Task API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            events: '/api/events',
            games: '/api/games',
            createEvent: 'POST /api/events',
            getEvents: 'GET /api/events',
            getGames: 'GET /api/games',
            getEventById: 'GET /api/events/:id',
            getGamesById: 'GET /api/games/:id',
            updateEvent: 'PUT /api/events/:id',
            deleteEvent: 'DELETE /api/events/:id'
        }
    });
});

// Routes - Add authentication later
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: {
                userId: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/auth/login - User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            message: 'Login successful',
            user: {
                userId: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/events - Get all events
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.findAll({
            where: { userId: req.user.userId }
        });
        res.json({
            message: 'Events retrieved successfully',
            events: events,
            total: events.length
        });

    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/events/:id - Get event by ID
app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findOne({
            where: {
                id: req.params.id,
                userId: req.user.userId
            }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);

    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/games - Get all games
app.get('/api/games', async (req, res) => {
    try {
        const games = await Game.findAll();
        res.json({
            message: 'Games retrieved successfully',
            games: games,
            total: games.length
        });

    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/games/:id - Get game by ID
app.get('/api/games/:id', async (req, res) => {
    try {
        const game = await Game.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json(game);

    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/events - Create new event
app.post('/api/events', async (req, res)=> {
    try {
        const { title, description, date, location } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        const newEvent = await Event.create({
            title,
            description,
            date,
            location,
            userId: req.user.userId
        });

        res.status(201).json(newEvent);

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/events/:id - Update event by ID
app.put('/api/events/:id', async (req, res) => {
    try {
        const { title, description, date, location } = req.body;

        const event = await Event.findOne({
            where: {
                id: req.params.id,
                userId: req.user.userId
            }
        });

        if (!event){
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.update({
            title,
            description,
            date,
            location
        });

        res.json(event);

    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
});

// DELETE /api/events/:id - Delete event by ID
app.delete('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findOne({
            where: {
                id: req.params.id,
                userId: req.user.userId
            }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.destroy();
        res.json({ message: 'Event deleted successfully' });

    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint Not Found',
        message: 'The requested endpoint does not exist'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    console.log('Environment: ${process.env.NODE_ENV}');
    console.log('Health check: http://localhost:${PORT}/health');
});
