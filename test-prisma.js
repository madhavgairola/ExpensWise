const prisma = require('./utils/prisma');

async function testConnection() {
    console.log('Testing Prisma connection...');
    try {
        const budget = await prisma.budget.findFirst();
        console.log('Connection successful! Found budget:', budget);
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await prisma.$disconnect();
        process.exit();
    }
}

testConnection();
