const { twilioAccountSid, twilioAuthToken, twilioVerifySid } = require('../config/config')
const client = require("twilio")(twilioAccountSid, twilioAuthToken);

async function sendVerificationCode(phoneNumber) {
    return client.verify.v2.services(twilioVerifySid)
        .verifications
        .create({ to: phoneNumber, channel: 'sms' })
        .then(verification => verification.sid);
}
async function checkVerificationCode(phoneNumber, code) {
    return client.verify.v2.services(twilioVerifySid)
        .verificationChecks
        .create({ to: phoneNumber, code: code })
        .then(verification_check => verification_check.status);
}
module.exports = {
    sendVerificationCode,
    checkVerificationCode
};

