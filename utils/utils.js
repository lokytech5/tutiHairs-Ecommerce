const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber');
const phoneNumberUtil = PhoneNumberUtil.getInstance();

function validatePhoneNumber(phoneNumber, defaultRegion) {
    try {
        const parsedPhoneNumber = phoneNumberUtil.parse(phoneNumber, defaultRegion);
        const isValid = phoneNumberUtil.isValidNumber(parsedPhoneNumber);

        if (isValid) {
            const formattedPhoneNumber = phoneNumberUtil.format(parsedPhoneNumber, PhoneNumberFormat.E164);
            return formattedPhoneNumber;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

module.exports = { validatePhoneNumber };
