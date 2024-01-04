const _ = require('lodash');
const User = require('../models/user');
const Cart = require('../models/shoppingCart');
const { validationResult } = require('express-validator')
const { sendVerificationEmail } = require('../mails/email')
const bcrypt = require('bcrypt')
const express = require('express');
const jwt = require('jsonwebtoken');
const { config } = require('../config/config')
const cloudinary = require('cloudinary').v2;



exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send({ users });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error retrieving users from database' });
    }
}


exports.getUsersById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).send(_.pick(user, ['_id', 'username', 'email']));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}


exports.createUsers = async (req, res) => {

    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const checkUser = await User.findOne({ email: req.body.email });
        if (checkUser) {
            return res.status(400).json({ msg: 'user already exists' });
        }

        const user = new User(_.pick(req.body, ['username', 'email', 'password', 'isVerified', 'isAdmin']))
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt)


        // Generate a verification token
        const verificationToken = jwt.sign({ userId: user._id }, config.jwtPrivateKey, { expiresIn: config.jwtExpiresIn });

        // Save the verification token in the user's document in the database
        user.emailVerificationToken = verificationToken;


        const savedUser = await user.save();

        //Create a new cart for the user
        const cart = new Cart({ user: savedUser._id, items: [] });
        await cart.save();

        const token = user.generateAuthToken();

        // Send a verification email to the user
        await sendVerificationEmail(user, verificationToken);
        res.header('x-auth-token', token).send(_.pick(savedUser, ['_id', 'username', 'email', 'isAdmin']));
    } catch (error) {
        res.status(500).send({ error: 'Error saving user to database' });
    }
}


exports.updateUsers = async (req, res) => {

    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const updateData = {};

    if (req.body.username) {
        updateData.username = req.body.username;
    }

    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.body.email) {
        updateData.email = req.body.email;
    }

    try {
        const updateUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updateUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(_.pick(updateUser, ['_id', 'username', 'email']));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.verifyCurrentPassword = async (req, res) => {
    const { userId, currentPassword } = req.body;

    // Validate the request body
    if (!userId || !currentPassword) {
        return res.status(400).send({ error: 'User ID and current password are required' });
    }
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (isMatch) {
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ error: 'Incorrect current password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteOwnUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).send({ message: 'User deleted successfully' });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

exports.deleteUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).send({ message: 'User deleted successfully' });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send({ user });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}


exports.updateUserProfile = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
            requestBody: req.body,
        });
    }


    try {
        const { profile } = req.body;

        if (!profile) {
            return res.status(400).send({ error: 'Profile data is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        user.profile = { ...user.profile, ...profile };

        await user.save();

        res.send({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


exports.uploadAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'Avatar file is missing' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                user.avatar = result.secure_url;
            } catch (uploadError) {
                console.error("Error uploading file to Cloudinary:", uploadError); // Log upload error
                throw uploadError; // Re-throw the error to be caught by the outer catch block
            }
        }
        await user.save();

        res.send({ message: 'Avatar uploaded successfully', user });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};



exports.updateNotificationPreferences = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { emailNotifications, pushNotifications } = req.body;

    if (emailNotifications === undefined && pushNotifications === undefined) {
        return res.status(400).send({ error: 'At least one preference should be provided' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        if (emailNotifications !== undefined) {
            user.notificationPreferences.emailNotifications = emailNotifications;
        }

        if (pushNotifications !== undefined) {
            user.notificationPreferences.pushNotifications = pushNotifications;
        }

        await user.save();
        res.send({ message: 'Notification preferences updated successfully', user });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};





