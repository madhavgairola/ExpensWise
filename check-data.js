const prisma = require('./utils/prisma');

async function checkData() {
    try {
        const allExpenses = await prisma.expense.findMany({
            orderBy: { transactionDate: 'desc' }
        });

        console.log('Total Expenses:', allExpenses.length);

        const febExpenses = allExpenses.filter(e => {
            const d = new Date(e.transactionDate);
            return d.getMonth() === 1 && d.getFullYear() === 2026;
        });

        const marchExpenses = allExpenses.filter(e => {
            const d = new Date(e.transactionDate);
            return d.getMonth() === 2 && d.getFullYear() === 2026;
        });

        console.log('February 2026 Expenses count:', febExpenses.length);
        console.log('March 2026 Expenses count:', marchExpenses.length);

        if (allExpenses.length > 0) {
            console.log('Latest 3 expenses:', allExpenses.slice(0, 3).map(e => ({
                desc: e.description,
                amount: e.amount,
                date: e.transactionDate
            })));
        }
    } catch (err) {
        console.error('Error checking data:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
