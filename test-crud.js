const axios = require('axios');

async function testRoutes() {
    try {
        console.log('--- Testing GET /api/dashboard ---');
        const dash = await axios.get('http://localhost:3000/api/dashboard');
        console.log('Dashboard OK, first expense ID:', dash.data.expenses[0]?.id);
        const firstId = dash.data.expenses[0]?.id;

        if (firstId) {
            console.log(`--- Testing PUT /api/expenses/${firstId} ---`);
            try {
                const putRes = await axios.put(`http://localhost:3000/api/expenses/${firstId}`, {
                    description: 'Test Update'
                });
                console.log('PUT OK:', putRes.status);
            } catch (e) {
                console.error('PUT Failed:', e.response?.status, e.response?.data);
            }

            console.log(`--- Testing DELETE /api/expenses/${firstId} ---`);
            try {
                const delRes = await axios.delete(`http://localhost:3000/api/expenses/${firstId}`);
                console.log('DELETE OK:', delRes.status);
            } catch (e) {
                console.error('DELETE Failed:', e.response?.status, e.response?.data);
            }
        }

        console.log('--- Testing DELETE /api/expenses/last ---');
        try {
            const lastRes = await axios.delete('http://localhost:3000/api/expenses/last');
            console.log('DELETE LAST OK:', lastRes.status);
        } catch (e) {
            console.error('DELETE LAST Failed:', e.response?.status, e.response?.data);
        }

    } catch (error) {
        console.error('Main error:', error.message);
    }
}

testRoutes();
