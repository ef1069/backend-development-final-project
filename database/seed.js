const bcrypt = require('bcryptjs');
const { db, User, Games, Event } = require('./setup');

async function seedDatabase() {
    try {
        await db.sync({ force: true });
        console.log('Database reset successfully.');

        const users = await User.bulkCreate([
            {
                name : 'John Doe',
                email: 'john@example.com',
                password: hashedPassword
            },
            {
                name : 'Jane Smith',
                email: 'jane@example.com',
                password: hashedPassword
            },
            {
                name : 'Mike Johnson',
                email : 'mike@example.com',
                password: hashedPassword
            }
        ]);

        await Games.bulkCreate([
            { 
                name: 'Poker',
                type: 'Card Game',
                difficulty: 'Medium',
                players: '3-8'
            },
            {
                name: 'Chess',
                type: 'Board Game',
                difficulty: 'Hard',
                players: '2'
            },
            {
                name: 'Trivia',
                type: 'Quiz Game',
                difficulty: 'Easy',
                players: '2-8'
            },
            {
                name: 'Monopoly',
                type: 'Board Game',
                difficulty: 'Medium',
                players: '3-8'
            },
            {
                name: 'Catan',
                type: 'Board Game',
                difficulty: 'Medium',
                players: '3-4'
            },
            {
                name: 'Fortnite',
                type: 'Video Game',
                difficulty: 'Medium',
                players: '1-4'
            },
            {
                name: 'Rocket League',
                type: 'Video Game',
                difficulty: 'Medium',
                players: '1-3'
            }
        ]);

        await Event.bulkCreate([
            {
                title: 'Poker Night',
                description: 'Join us for a fun night of poker!',
                date: new Date('2026-07-15'),
                location: '123 Main St, Anytown',
                userId: users[0].id
            },
            {
                title: 'Board Game Night',
                description: 'Bring your favorite board games and join us for a night of fun!',
                date: new Date('2026-08-20'),
                location: '456 Elm St, Anytown',
                userId: users[1].id
            },
            {
                title: 'Trivia Night',
                description: 'Test your knowledge with us at our trivia night!',
                date: new Date('2026-09-10'),
                location: '789 Oak St, Anytown',
                userId: users[2].id
            },
            {
                title: 'Video Game Tournament',
                description: 'Compete in our video game tournament for a chance to win prizes!',
                date: new Date('2026-10-05'),
                location: '321 Pine St, Anytown',
                userId: users[0].id
            }
         ]);
         
         console.log('Database seeded successfully.');
         console.log('Sample users created');
         console.log('- john@example.com');
         console.log('- jane@example.com');
         console.log('- mike@example.com');
         console.log('Sample events created', await Event.count());

        } catch (error) {
            console.error('Error seeding database:', error);
        } finally {
            await db.close();
        }
    }

seedDatabase();