const bcrypt = require('bcryptjs');
const { db, User, Event } = require('./setup');

async function seedDatabase() {
    try {
        await db.sync({ force: true });
        console.log('Database reset successfully.');

        const hashedPassword = await bcrypt.hash('password123', 10);

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