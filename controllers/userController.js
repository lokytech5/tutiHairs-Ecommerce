const _ = require('lodash');
const User = require('../models/user');
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const express = require('express');
const config = require('../config/config')
const cloudinary = config.cloudinary;


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

        const user = new User(_.pick(req.body, ['username', 'email', 'password']))
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt)

        const savedUser = await user.save();
        const token = user.generateAuthToken();
        res.header('x-auth-token', token).send(_.pick(savedUser, ['_id', 'username', 'email']));
    } catch (error) {
        console.error('Error in registration:', error.message);
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


exports.deleteUsers = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).send({ message: 'User deleted successfully' });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}


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
        return res.status(400).json({ errors: errors.array() });
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

        // Check if an avatar file was provided
        if (req.file) {
            // Upload the avatar to Cloudinary and update the user's avatar field
            const result = await cloudinary.uploader.upload(req.file.path);
            user.avatar = result.secure_url;
        }

        await user.save();

        res.send({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};
