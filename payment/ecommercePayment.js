const { paystackConfig } = require('../config/config')
const https = require('https')
const paystack = require('paystack')(paystackConfig.secretKey);
const crypto = require('crypto');

exports.initializeTransaction = async (req, res) => {
    const params = JSON.stringify({
        email: req.body.email,
        amount: req.body.amount * 100,
        callback_url: "http://localhost:3000/paymentCallbackPage",
        metadata: {
            paymentOption: req.body.paymentOption, // Pass the payment option in the request body
        },
    });

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


const processOrderPayment = async (transactionDetails) => {
    // Implement the logic for processing order payments
    // Update order status, notify the user, etc.
};

const processTrainingClassPayment = async (transactionDetails) => {
    // Implement the logic for processing training class payments
    // Register the user for the class, generate a unique code, send an email, etc.
};




exports.handleWebhook = async (req, res) => {

    // Handle the event
    const event = req.body;

    try {
        switch (event.event) {
            case 'charge.success':
                const transactionDetails = await verifyTransaction(event.data.reference);

                if (!transactionDetails) {
                    // Transaction verification failed, return an error or handle as needed
                    break;
                }

                if (transactionDetails.metadata && transactionDetails.metadata.paymentOption === 'order') {
                    await processOrderPayment(transactionDetails);
                } else if (transactionDetails.metadata && transactionDetails.metadata.paymentOption === 'trainingClass') {
                    await processTrainingClassPayment(transactionDetails);
                } else {
                    return res.status(400).send({ error: 'Invalid payment option' });
                }

                break;

            case 'charge.failed':
                // Handle failed payment
                // Notify the user, update their account status, etc.
                break;

            // Add other event cases you want to handle

            default:
                return res.status(400).send({ error: 'Unhandled event type' });
        }

        res.status(200).send({ message: 'Webhook event processed' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};
