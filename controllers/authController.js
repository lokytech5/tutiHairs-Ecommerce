const _ = require('lodash');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt');
const { config } = require('../config/config')
const { sendOTPEmail } = require('../mails/email')


function generateOTPAndToken(user) {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const token = jwt.sign({ id: user._id, otp }, config.jwtPrivateKey, { expiresIn: '15m' }); // Create an OTP token with a 15-minute expiration time

    return { otp, token };
}

exports.createAuth = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password)

        if (!validPassword) {
            return res.status(400).json({ msg: 'Invalid username or password' });
        }
        const token = user.generateAuthToken();

        // Set JWT token as HttpOnly cookie
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

        res.send({ token, username: user.username });

    } catch (error) {
        res.status(500).send({ error: 'Error during authentication process', details: error.message });
    }
}


exports.verifyEmail = async (req, res) => {
    const token = req.body.token;

    if (!token) {
        return res.status(400).send({ error: 'Token is missing' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtPrivateKey);

        if (!decoded || !decoded.userId) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            user.isVerified = true; // if user model has a isVerified field
            await user.save();
        }

        res.status(200).json({ message: 'Email has been successfully verified' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing your request', error: error.message });
    }
};



exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { otp, token } = generateOTPAndToken(user);

        user.resetPasswordToken = token;

        await user.save();

        await sendOTPEmail(user, otp, token); // Send the OTP to the user's email

        res.status(200).json({ message: 'An OTP and a password reset link have been sent to your email' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing your request', error: error.message });
    }
};


exports.resetPassword = async (req, res) => {
    const { otp, newPassword, token } = req.body;

    try {

        const decoded = jwt.verify(token, config.jwtPrivateKey);

        if (!decoded || !decoded.id || !decoded.otp) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        if (decoded.otp !== parseInt(otp, 10)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.resetPasswordToken !== token) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.password = newPassword; // Set the new password (make sure to hash it before saving, as per your user model)
        user.resetPasswordToken = undefined; // Clear the reset password token
        await user.hashPassword();
        await user.save();

        res.status(200).json({ message: 'Password has been updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing your request', error: error.message });
    }
};