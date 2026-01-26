const https = require('https');

exports.handler = async function (event, context) {
    const { order_id } = event.queryStringParameters;

    if (!order_id) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing order_id' }) };
    }

    const APP_ID = process.env.VITE_CASHFREE_APP_ID;
    const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
    const API_VERSION = '2022-09-01';
    const MODE = process.env.VITE_CASHFREE_MODE || 'production';
    const URL = MODE === 'production'
        ? `https://api.cashfree.com/pg/orders/${order_id}`
        : `https://sandbox.cashfree.com/pg/orders/${order_id}`;

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': APP_ID,
            'x-client-secret': SECRET_KEY,
            'x-api-version': API_VERSION
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(URL, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const order = JSON.parse(data);
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify({
                            status: order.order_status, // "PAID", "ACTIVE", "FAILED"
                            amount: order.order_amount,
                            currency: order.order_currency
                        })
                    });
                } else {
                    resolve({
                        statusCode: res.statusCode,
                        body: data
                    });
                }
            });
        });

        req.on('error', (e) => {
            resolve({
                statusCode: 500,
                body: JSON.stringify({ error: e.message })
            });
        });

        req.end();
    });
};
