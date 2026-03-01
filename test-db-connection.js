const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function testConnection() {
    console.log('Testing connection to:', connectionString.split('@')[1]);
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
    });

    try {
        const client = await pool.connect();
        console.log('Successfully connected to the database!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
        client.release();
    } catch (err) {
        console.error('Connection failed:', err.message);
        if (err.message.includes('timeout')) {
            console.log('TIP: This looks like a network timeout. Check if your firewall or ISP is blocking port 6543.');
        }
    } finally {
        await pool.end();
    }
}

testConnection();
