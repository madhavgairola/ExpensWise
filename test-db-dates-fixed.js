const prisma = require('./utils/prisma');

async function check() {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { transactionDate: 'desc' }
        });
        console.log('--- All Expenses in DB ---');
        expenses.forEach(e => {
            console.log(`${e.transactionDate.toISOString()} | ₹${e.amount} | ${e.description}`);
        });

        const now = new Date();
        console.log('\n--- Current System Time ---');
        console.log('Local:', now.toString());
        console.log('UTC:', now.toUTCString());
        console.log('Day:', now.getUTCDate());
        console.log('Month (1-indexed UTC):', now.getUTCMonth() + 1);
        console.log('Year (UTC):', now.getUTCFullYear());

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
