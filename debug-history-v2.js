const analyticsService = require('./services/analytics.service');
const prisma = require('./utils/prisma');

async function debug() {
    try {
        const history = await analyticsService.getHistory();
        console.log('--- RAW HISTORY DATA ---');
        console.log(JSON.stringify(history, null, 2));

        const now = new Date();
        console.log('\n--- SERVER CLOCK ---');
        console.log('Local:', now.toString());
        console.log('UTC:', now.toUTCString());
        console.log('UTC month (0-based):', now.getUTCMonth());
        console.log('UTC year:', now.getUTCFullYear());

    } catch (err) {
        console.error('Debug Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
