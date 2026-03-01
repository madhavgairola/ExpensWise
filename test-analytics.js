const { getDashboardAnalytics } = require('./services/analytics.service');

async function test() {
    try {
        console.log('Testing getDashboardAnalytics(3, 2026)...');
        const res = await getDashboardAnalytics(3, 2026);
        console.log('Success! Result expenses count:', res.expenses.length);
        console.log('First expense:', res.expenses[0]);
    } catch (err) {
        console.error('FAILED:', err);
    } finally {
        process.exit();
    }
}

test();
