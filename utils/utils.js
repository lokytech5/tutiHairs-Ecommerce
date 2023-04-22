const PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
const PNF = require('google-libphonenumber').PhoneNumberFormat;

function validatePhoneNumber(phone) {
    const phoneUtil = PhoneNumberUtil.getInstance();

    try {
        const parsedPhoneNumber = phoneUtil.parseAndKeepRawInput(phone);
        if (phoneUtil.isValidNumber(parsedPhoneNumber)) {
            return phoneUtil.format(parsedPhoneNumber, PNF.E164);
        }
    } catch (error) {
        console.error('Error parsing phone number:', error);
    }

    return null;
}

module.exports = { validatePhoneNumber };
