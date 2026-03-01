const analyticsService = require('./services/analytics.service');

async function verify() {
    try {
        const history = await analyticsService.getHistory();
        console.log('--- Historical Data (History Endpoint Mock) ---');
        history.forEach(item => {
            console.log(`${item.monthName} ${item.year} | Total: ₹${item.total} | Month Index: ${item.month}`);
        });

        const now = new Date();
        const currentAnalytics = await analyticsService.getDashboardAnalytics(now.getUTCMonth() + 1, now.getUTCFullYear());
        console.log('\n--- Current Month Analytics (March 2026) ---');
        console.log(`Total Spent: ₹${currentAnalytics.totalSpent}`);
        console.log('Transactions in this bucket:');
        currentAnalytics.expenses.forEach(e => {
            console.log(`  - ${e.transactionDate.toISOString()} | ₹${e.amount} | ${e.description}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        const prisma = require('./utils/prisma');
        await prisma.$disconnect();
    }
}

verify();
