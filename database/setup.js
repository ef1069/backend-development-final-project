const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize database connection
const db = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_NAME ? `database/${process.env.DB_NAME}` : 'events.db',
    logging: false
});

// User model
const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
            type: DataTypes.STRING,
            allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'participant', 'host'),
        allowNull: false,
        defaultValue: 'participant'
    }
});

// Games model
const Games = db.define('Games', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    difficulty: {
        type: DataTypes.STRING,
        allowNull: false
    },
    players: {
        type: DataTypes.STRING,
        allowNull: false
    }
});


// Event model
const Event = db.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    participants: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]'
    }
});

// Define relationships
User.hasMany(Event, { foreignKey: 'userId' });
Event.belongsTo(User, { foreignKey: 'userId' });
Games.hasMany(Event, { foreignKey: 'gameId' });
Event.belongsTo(Games, { foreignKey: 'gameId' });

// Initialize database
async function initializeDatabase() {
    try {
        await db.authenticate();
        console.log('Database connection established successfully.');

        await db.sync();
        console.log ('Database synchronized successfully.');

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

initializeDatabase();

module.exports = {
    db,
    User,
    Games,
    Event
};