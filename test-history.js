const { getHistory } = require('./services/analytics.service');

async function test() {
    try {
        console.log('Testing getHistory()...');
        const res = await getHistory();
        console.log('Success! Registry history count:', res.length);
        console.log('Latest month in history:', res[0]);
    } catch (err) {
        console.error('FAILED:', err);
    } finally {
        process.exit();
    }
}

test();
