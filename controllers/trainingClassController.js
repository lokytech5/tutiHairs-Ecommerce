const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const { validatePhoneNumber } = require('../utils/utils')
const TrainingClass = require('../models/trainingClass');
const ClassTypePrice = require('../models/classTypePrice');
const User = require('../models/user');
const { isEmail } = require('validator');
const { sendConfirmationEmailForRegisteredTraningClass } = require('../mails/email');

exports.getAllTrainingClasses = async (req, res) => {
    try {
        const trainingClasses = await TrainingClass.find()
            .populate({
                path: 'participants.user',
                select: 'email username profile'
            })

            .populate({
                path: 'type',
                select: 'classType price' // Choose the fields you want to display from the ClassTypePrice collection
            })
            .exec();

        res.status(200).send({ trainingClasses });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error retrieving trainingClasses from database' });
    }
}


exports.getTrainingClassById = async (req, res) => {
    try {
        const trainingClass = await TrainingClass.findById(req.params.id)
            .populate('type')
            .populate({
                path: 'participants.user',
                select: 'email username profile'
            });

        if (!trainingClass) {
            return res.status(404).json({ error: 'TrainingClass not found' });
        }
        res.status(200).json(trainingClass);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.createTrainingClasses = async (req, res) => {

    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    try {

        const { title, description, startDate, endDate, type, maxParticipants, maxRegistrations } = req.body;


        // Create a new training class object
        const newTrainingClass = new TrainingClass({
            title,
            description,
            startDate,
            endDate,
            type,
            maxParticipants,
            maxRegistrations,
            registrationDeadline: new Date(req.body.registrationDeadline),
        });

        // Save the new training class object to the database

        const savedTrainingClass = await newTrainingClass.save();

        // Send a success response with the saved training class
        res.status(201).send({ trainingClass: savedTrainingClass });


    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error creating the training class' });
    }

}


exports.updateTrainingClasses = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const updateData = {};
    if (req.body.title) {
        updateData.title = req.body.title;
    }
    if (req.body.description) {
        updateData.description = req.body.description;
    }
    if (req.body.startDate) {
        updateData.startDate = req.body.startDate;
    }
    if (req.body.endDate) {
        updateData.endDate = req.body.endDate;
    }
    if (req.body.type) {
        updateData.type = req.body.type;
    }
    if (req.body.maxParticipants) {
        updateData.maxParticipants = req.body.maxParticipants;
    }

    if (req.body.maxRegistrations) {
        updateData.maxRegistrations = req.body.maxRegistrations;
    }

    try {

        // Check if the ClassTypePrice exists
        if (updateData.type) {
            const classTypePrice = await ClassTypePrice.findById(updateData.type);
            if (!classTypePrice) {
                return res.status(404).json({ error: 'ClassTypePrice not found' });
            }
        }

        const updatedTraningClass = await TrainingClass.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedTraningClass) {
            return res.status(404).json({ error: 'Training class not found' })
        }

        res.status(200).json(updatedTraningClass);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.deleteTrainingClasses = async (req, res) => {
    try {

        const trainingClass = await TrainingClass.findByIdAndDelete(req.params.id);

        if (!trainingClass) {
            return res.status(404).json({ error: 'TrainingClass not found' });
        }

        res.status(200).send({ message: 'TrainingClass deleted successfully' })

    } catch (error) {
        res.status(500).send({ error: error.message });
    }

}


exports.getUserTrainingClasses = async function (req, res) {
    try {
        // Assuming 'req.user' contains the authenticated user
        const userTrainingClasses = await TrainingClass.find({ "participants.user": req.user._id })
            .populate({
                path: 'participants.user',
                select: 'name email' // Choose the fields you want to display from the User collection
            })
            .populate({
                path: 'type',
                select: 'classType price' // Choose the fields you want to display from the ClassTypePrice collection
            });
        res.status(200).json(userTrainingClasses);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}


exports.registerUsersForTrainingClass = async (req, res) => {

    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    try {
        let userId = req.user ? req.user._id : null;
        const trainingClassId = req.params.id; // Get the training class ID from the request parameters


        let newUser = null;
        const { email } = req.body;

        if (!req.user) {
            const { email, password, username, phone, firstName, lastName } = req.body;

            const validatedPhoneNumber = validatePhoneNumber(phone);

            if (!validatedPhoneNumber) {
                return res.status(400).send({ error: 'Invalid phone number' });
            }

            if (!firstName || !lastName) {
                return res.status(400).send({ error: 'First and last names are required' });
            }

            if (!email || !isEmail(email)) {
                return res.status(400).send({ error: 'Invalid email address' });
            }

            userEmail = email;

            const existingUser = await User.findOne({ email });

            if (existingUser) {
                userId = existingUser._id;
            } else {
                newUser = new User({ email, password, username, profile: { firstName, lastName, phone: validatePhoneNumber } });
                // Hash the password before saving the new user
                const salt = await bcrypt.genSalt(10);
                newUser.password = await bcrypt.hash(newUser.password, salt);

                await newUser.save();
                userId = newUser._id;
            }
        } else {
            userId = req.user._id;
            userEmail = req.user.email;
        }

        // Find the training class
        const trainingClass = await TrainingClass.findById(trainingClassId).populate('participants.user');

        if (!trainingClass) {
            return res.status(404).send({ error: 'Training class not found' });
        }

        // Check if the maximum number of participants has been reached
        if (trainingClass.participants.length >= trainingClass.maxParticipants) {
            return res.status(400).send({ error: 'This training class has reached the maximum number of participants' });
        }
        //const userEmail = req.user ? req.user.email : req.body.email;

        // Check if the user is already registered for the class
        const isUserAlreadyRegistered = trainingClass.participants.some((participant) => {
            return participant.user && participant.user._id.toString() === userId.toString();
        });

        if (isUserAlreadyRegistered) {
            return res.status(400).send({ error: 'User is already registered for this training class' });
        }

        // Add the user to the participants list and update the training class
        let updatedTrainingClass = null;
        if (userId) {
            trainingClass.participants.push({ user: userId });
            updatedTrainingClass = await trainingClass.save();
        }

        // Get user data for sending the confirmation email
        const userToNotify = newUser || await User.findById(userId);

        // Send a confirmation email
        await sendConfirmationEmailForRegisteredTraningClass(userToNotify, trainingClass);
        res.status(200).send({ message: 'User registered successfully', trainingClass: updatedTrainingClass });

    } catch (error) {

        console.error('Error registering user for the training class:', error.message);

        if (error.code === 11000) {
            return res.status(400).send({ error: 'This email address has already been used to register for this training class' });
        }

        res.status(500).send({ error: 'Error registering user for the training class' });
    }

}


exports.unregisterUsersForTrainingClass = async (req, res) => {
    try {
        const userEmail = req.user ? req.user.email : req.body.email; // Get the user email from the request (if authenticated) or from the request body (if not authenticated)
        // const userId = req.user._id; // You can get the user ID from the request (assuming the user is authenticated)
        const trainingClassId = req.params.id; // Get the training class ID from the request parameters

        // Find the training class
        const trainingClass = await TrainingClass.findById(trainingClassId);

        if (!trainingClass) {
            return res.status(404).send({ error: 'Training class not found' });
        }

        // Find the user by email
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        }

        // Find the user in the participants list //userId
        const userIndex = trainingClass.participants.findIndex(
            (participant) => participant.user.toString() === user._id.toString()
        );

        if (userIndex === -1) {
            return res.status(400).send({ error: 'User is not registered for this training class' });
        }

        // Remove the user from the participants list and update the training class
        trainingClass.participants.splice(userIndex, 1);
        const updatedTrainingClass = await trainingClass.save();

        res.status(200).send({ message: 'User unregistered successfully', trainingClass: updatedTrainingClass });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error unregistering user from the training class' });
    }
};

