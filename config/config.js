const cloudinary = require('cloudinary').v2;

const config = {
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
    jwtExpiresIn: "1h",
};


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const paystackConfig = {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
}


const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioVerifySid = process.env.TWILIO_VERIFY_SID


module.exports = {
    config,
    cloudinary,
    paystackConfig,
    twilioAccountSid,
    twilioAuthToken,
    twilioVerifySid,
}

