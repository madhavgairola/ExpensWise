const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);

// In Prisma 7, when using an adapter, we pass it to the constructor.
// If the URL is missing from schema.prisma, we don't need to pass it here
// because the pg pool already has the connection string.
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
