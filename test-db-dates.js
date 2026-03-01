const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const expenses = await prisma.expense.findMany({
        orderBy: { transactionDate: 'desc' }
    });
    console.log('--- All Expenses ---');
    expenses.forEach(e => {
        console.log(`${e.transactionDate.toISOString()} | ₹${e.amount} | ${e.description}`);
    });

    const now = new Date();
    console.log('\n--- Current System Time ---');
    console.log('Local:', now.toString());
    console.log('UTC:', now.toUTCString());
}

check().finally(() => prisma.$disconnect());
