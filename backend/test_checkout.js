
const API_URL = 'http://localhost:5000/api';
let token = '';

const runTest = async () => {
    try {
        console.log('1. Registering/Logging in Consumer...');
        let userId;

        // Try login first
        let loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'consumer_test_final@test.com', password: 'password123' })
        });

        if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.token;
            console.log('   - Logged in successfully');
        } else {
            // Register
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Test Consumer',
                    email: 'consumer_test_final@test.com',
                    password: 'password123',
                    phone: '9988776655',
                    role: 'consumer'
                })
            });
            const data = await regRes.json();
            if (!regRes.ok) throw new Error(data.message || 'Registration failed');
            token = data.token;
            console.log('   - Registered successfully');
        }

        console.log('2. Fetching a crop...');
        const cropRes = await fetch(`${API_URL}/crops?limit=1`);
        const cropData = await cropRes.json();

        if (!cropData.data || cropData.data.length === 0) throw new Error('No crops found! Seed failed?');
        const crop = cropData.data[0];
        console.log(`   - Found crop: ${crop.name} (ID: ${crop._id}, Price: ${crop.expectedPrice})`);

        console.log('3. Placing Order...');
        const orderPayload = {
            items: [{
                cropId: crop._id,
                quantity: { value: 1, unit: crop.quantity.unit || 'kg' },
                pricePerUnit: crop.expectedPrice
            }],
            deliveryAddress: {
                street: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                zip: '12345'
            },
            paymentMethod: 'cod'
        };

        const orderRes = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderPayload)
        });

        const orderResult = await orderRes.json();
        console.log('   - Order Response Status:', orderRes.status);

        if (orderRes.ok) {
            console.log('   - Order Created ID:', orderResult.data[0]._id);
            console.log('SUCCESS: Order placed without server error.');
        } else {
            console.error('FAILURE:', orderResult);
            process.exit(1);
        }

    } catch (error) {
        console.error('Test Script Error:', error);
        process.exit(1);
    }
};

runTest();
