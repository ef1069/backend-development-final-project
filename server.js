const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, User, Games, Event } = require('./database/setup');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// JWT Authentication
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Access denied. No token provided'
        });
    }

    const token = authHeader.substring(7);

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                error: 'Invalid token. User not found'
            });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        next();
    } catch (error){
        if (error.name === 'TokenExpiredError'){
            return res.status(401).json({
                error: 'Token expired. Please log in again'
            });
        } else if (error.name === 'JsonWebTokenError'){
            return res.status(401).json({
                error: 'Invalid token. Please log in again.'
            });
        } else {
            return res.status(401).json({
                error: 'Token verification failed'
            });
        }
    }
}

// Role-based authorization
function requireRole(role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied. Insufficient permissions'
            });
        }
        next();
    };
}

// Test database connection
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
        message: 'Event API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Event API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            register: 'POST /api/register',
            login: 'POST /api/login',
            logout: 'POST /api/logout',
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

// POST /api/register - User registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'participant'
        });

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: {
                userId: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const isValidPassword = await bcrypt.compare(password,user.password);
        if(!isValidPassword){
            return res.status(401).json({
                error:'Invalid email or password'
            });
        }

        const token = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
    );
     
        res.json({
            message: 'Login successful',
            token: token,
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/logout - User logout
app.post('/api/logout', requireAuth, (req, res) => {
    res.json({ 
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
    });
});

// GET /api/events - Get all events
app.get('/api/events', requireAuth, async (req, res) => {
    try {
        const events = await Event.findAll();
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
app.get('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const event = await Event.findOne({
            where: {
                id: req.params.id
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
app.get('/api/games', requireAuth, async (req, res) => {
    try {
        const games = await Games.findAll();
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
app.get('/api/games/:id', requireAuth, async (req, res) => {
    try {
        const game = await Games.findOne({
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
app.post('/api/events', requireAuth, requireRole(['admin', 'host']), async (req, res)=> {
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
            userId: req.user.id
        });

        res.status(201).json(newEvent);

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/events/:id - Update event by ID
app.put('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const { title, description, date, location } = req.body;

        const event = await Event.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!event){
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check ownership or admin role
        if (event.userId !== Number(req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Access denied. You can only modify your own events' 
            });
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
app.delete('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const event = await Event.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check ownership or admin role
        if (event.userId !== Number(req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Access denied. You can only delete your own events' 
            });
        }

        await event.destroy();
        res.json({ message: 'Event deleted successfully' });

    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
});

// POST /api/events/:id/join - Join an event
app.post('/api/events/:id/join', requireAuth, async (req, res) => {
    try {
        const event = await Event.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const participants = JSON.parse(event.participants || '[]');
        if (participants.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already joined this event' });
        }

        participants.push(req.user.id);
        await event.update({ participants: JSON.stringify(participants) });

        res.json({ message: 'Successfully joined the event' });

    } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/events/:id/join - Leave an event
app.delete('/api/events/:id/join', requireAuth, async (req, res) => {
    try {
        const event = await Event.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const participants = JSON.parse(event.participants || '[]');
        const index = participants.indexOf(req.user.id);
        if (index === -1) {
            return res.status(400).json({ message: 'Not joined this event' });
        }

        participants.splice(index, 1);
        await event.update({ participants: JSON.stringify(participants) });

        res.json({ message: 'Successfully left the event' });

    } catch (error) {
        console.error('Error leaving event:', error);
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
