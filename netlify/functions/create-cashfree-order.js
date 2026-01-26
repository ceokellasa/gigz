const https = require('https');

exports.handler = async function (event, context) {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { plan_id, user_id, user_phone, user_email, user_name, price } = JSON.parse(event.body);

        if (!plan_id || !user_id || !price) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
        }

        const APP_ID = process.env.VITE_CASHFREE_APP_ID;
        const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
        const API_VERSION = '2022-09-01';
        // Use SANDBOX URL for safety unless MODE is explicitly production
        const MODE = process.env.VITE_CASHFREE_MODE || 'production';
        const URL = MODE === 'production'
            ? 'https://api.cashfree.com/pg/orders'
            : 'https://sandbox.cashfree.com/pg/orders';

        const orderId = `order_${user_id.split('-')[0]}_${Date.now()}`;

        const siteUrl = (process.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');

        const payload = JSON.stringify({
            order_id: orderId,
            order_amount: price,
            order_currency: 'INR',
            customer_details: {
                customer_id: user_id,
                customer_email: user_email || 'user@example.com',
                customer_phone: user_phone || '9999999999',
                customer_name: user_name || 'User'
            },
            order_meta: {
                return_url: `${siteUrl}/subscription/success?order_id={order_id}&plan_id=${plan_id}`,
            },
            order_note: `Subscription for ${plan_id}`
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': APP_ID,
                'x-client-secret': SECRET_KEY,
                'x-api-version': API_VERSION,
                'Content-Length': payload.length
            }
        };

        // Return a promise to handle the async https request
        return new Promise((resolve, reject) => {
            const req = https.request(URL, options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({
                            statusCode: 200,
                            body: data
                        });
                    } else {
                        console.error('Cashfree Error:', data);
                        resolve({
                            statusCode: res.statusCode || 500,
                            body: JSON.stringify({ error: 'Payment gateway error', details: JSON.parse(data) })
                        });
                    }
                });
            });

            req.on('error', (e) => {
                console.error('Request Error:', e);
                resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: e.message })
                });
            });

            req.write(payload);
            req.end();
        });

    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid Request', details: error.message })
        };
    }
};
