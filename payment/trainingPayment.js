const { paystackConfig } = require('../config/config')
const https = require('https')
const paystack = require('paystack')(paystackConfig.secretKey);
const crypto = require('crypto');

exports.initializeTransaction = async (req, res) => {
    console.log(req.body);
    const params = JSON.stringify({
        email: req.body.email,
        amount: req.body.amount * 100,
        metadata: {
            paymentOption: req.body.paymentOption, // Pass the payment option in the request body
        },
    });

    console.log("Params for Paystack:", params);

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${paystackConfig.secretKey}`,
            'Content-Type': 'application/json',
        },
    };

    const reqPayStack = https
        .request(options, (reqPayStack) => {
            let data = '';

            reqPayStack.on('data', (chunk) => {
                data += chunk;
            });

            reqPayStack.on('end', () => {
                res.status(200).header("Content-Type", "application/json").send(data);
                console.log(JSON.parse(data));
            });
        })
        .on('error', (error) => {
            console.error(error);
        });

    reqPayStack.write(params);
    reqPayStack.end();
};



exports.verifyTransaction = async (req, res) => {
    const reference = req.body.reference;

    if (!reference || typeof reference !== 'string') {
        return res.status(400).send({ error: 'Invalid reference number' });
    }


    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: `/transaction/verify/${reference}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${paystackConfig.secretKey}`,
        }
    }

    https.request(options, apiResponse => {
        let data = ''

        apiResponse.on('data', (chunk) => {
            data += chunk
        });

        apiResponse.on('end', () => {
            const responseData = JSON.parse(data);

            // Check if the Paystack API returned an error
            if (responseData.status === false) {
                return res.status(500).send({ error: responseData.message });
            }

            res.status(200).send(responseData);
        })
    }).on('error', error => {
        console.error(error);
        res.status(500).send({ error: 'Error in Paystack transaction verification' });
    })
        .end();
};