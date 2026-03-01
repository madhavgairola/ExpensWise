const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function testConnection() {
    console.log('Testing connection to:', connectionString.replace(/:[^:@]+@/, ':****@'));
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Successfully connected to database!');
        const res = await client.query('SELECT NOW()');
        console.log('Query successful:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    }
}

testConnection();
