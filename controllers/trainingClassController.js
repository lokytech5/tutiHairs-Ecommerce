const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const { validatePhoneNumber } = require('../utils/utils')
const TrainingClass = require('../models/trainingClass');
const ClassTypePrice = require('../models/classTypePrice');
const VerifiedPhoneNumber = require('../models/verifiedPhoneNum');
const TrainingClassOrder = require('../models/trainingClassOrder');
const Service = require('../models/service');
const User = require('../models/user');
const { isEmail } = require('validator');
const { sendConfirmationEmailForRegisteredTraningClass } = require('../mails/email');
const { sendVerificationCode, checkVerificationCode } = require('../api/twilioVerification');

exports.getAllTrainingClasses = async (req, res) => {
    try {
        const trainingClasses = await TrainingClass.find()
            .populate({
                path: 'participants.user',
                select: 'email username profile'
            })
            .populate('selectedServices')
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
            .populate('services')
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

    if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
    }


    try {

        const { title, description, type, maxParticipants, maxRegistrations } = req.body;

        //Getting image url from uploaded file
        const image = req.file.path;

        // Create a new training class object
        const newTrainingClass = new TrainingClass({
            title,
            image,
            description,
            type,
            maxParticipants,
            maxRegistrations,
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
    if (req.body.image) {
        updateData.image = req.body.image;
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
            .populate('services')
            .populate({
                path: 'type',
                select: 'classType price' // Choose the fields you want to display from the ClassTypePrice collection
            });
        res.status(200).json(userTrainingClasses);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}


exports.verifyPhoneNumber = async (req, res) => {
    const { phone, code } = req.body;

    const validatedPhoneNumber = validatePhoneNumber(phone);

    try {
        const status = await checkVerificationCode(validatedPhoneNumber, code);

        if (status !== 'approved') { // 'approved' is the status for a successful verification
            return res.status(400).send({ error: 'Invalid verification code' });
        }

        // Mark the phone number as verified
        await VerifiedPhoneNumber.create({ phone: validatedPhoneNumber });
        res.status(200).send({ message: 'Phone number verified successfully' });

    } catch (error) {

        if (error.status === 404) { // Check if it's a 'resource not found' error
            // Check if the phone number has already been verified
            const existingPhoneNumber = await VerifiedPhoneNumber.findOne({ phone: validatedPhoneNumber });
            if (existingPhoneNumber) {
                return res.status(200).send({ error: 'This number has already been verified.' });
            }
        }
        console.log('Error when checking verification code:', error.message);
        return res.status(500).send({ error: 'Failed to check verification code' });
    }
};


exports.registerUsersForTrainingClass = async (req, res) => {

    console.log('Starting registerUsersForTrainingClass...');

    if (!req.body) {
        console.log('No request body provided');
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    console.log('Validation errors', errors.array());
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const trainingClassId = req.params.id;

        let selectedServices = req.body.selectedServices || [];

        const { phone, firstName, lastName } = req.body;
        console.log('Received data:', phone, firstName, lastName);

        if (!phone) {
            return res.status(400).send({ error: 'Phone are required' })
        }

        if (!firstName || !lastName) {
            console.log('First and last names are required');
            return res.status(400).send({ error: 'First and last names are required' });
        }

        const validatedPhoneNumber = validatePhoneNumber(phone);

        if (!validatedPhoneNumber) {
            console.log('Invalid phone number');
            return res.status(400).send({ error: 'Invalid phone number' });
        }

        const existingVerifiedPhoneNumber = await VerifiedPhoneNumber.findOne({ phone: validatedPhoneNumber });

        // Find the training class
        const trainingClass = await TrainingClass.findById(trainingClassId).populate('participants.user').populate('type');

        if (!trainingClass) {
            console.log('Training class not found');
            return res.status(404).send({ error: 'Training class not found' });
        }

        // Check if the maximum number of participants has been reached
        if (trainingClass.participants.length >= trainingClass.maxParticipants) {
            console.log('This training class has reached the maximum number of participants');
            return res.status(400).send({ error: 'This training class has reached the maximum number of participants' });
        }

        // Find the services and their costs
        let totalServiceCost = 0;
        let services;
        if (selectedServices.length > 0) {
            services = await Service.find({ '_id': { $in: selectedServices } });

            if (services.length !== selectedServices.length) {
                //Some services could not be found
                return res.status(400).send({ error: 'One or more services not found' });
            }

            totalServiceCost = services.reduce((total, service) => total + service.price, 0);
        }


        // Assuming your TrainingClass model has a type field which has a price field
        const totalCost = trainingClass.type.price + totalServiceCost;

        const isUserAlreadyRegistered = trainingClass.participants.some((participant) => {
            return participant.user && participant.user._id.toString() === req.user._id.toString();
        });

        if (isUserAlreadyRegistered) {
            return res.status(400).send({ error: 'User is already registered for this training class' });
        }

        //Create a new training class order
        const newOrder = new TrainingClassOrder({
            user: req.user._id,
            trainingClass: trainingClassId,
            services: services,
            totalCost: totalCost,
            isPaid: false,
        });

        console.log('Saving new order:', newOrder);
        try {
            await newOrder.save();
        } catch (err) {
            console.error('Error saving order:', err);
            return res.status(500).send({ error: 'Error saving order' });
        }

        // Add the user to the participants list and update the training class       
        trainingClass.participants.push({ user: req.user._id, paymentStatus: 'pending', accessStatus: 'pending' });

        // Only add services that aren't already in the selectedServices array
        selectedServices.forEach((serviceId) => {
            if (!trainingClass.selectedServices.includes(serviceId)) {
                trainingClass.selectedServices.push(serviceId);
            }
        });

        console.log('Updating training class...');
        let updatedTrainingClass;
        let verificationCode
        updatedTrainingClass = await trainingClass.save();

        if (!existingVerifiedPhoneNumber) {
            verificationCode = await sendVerificationCode(validatedPhoneNumber);
        }

        const response = {
            message: 'User registered successfully',
            trainingClass: updatedTrainingClass,
            orderId: newOrder._id,
            isPhoneVerified: existingVerifiedPhoneNumber ? true : false
        }
        console.log('User registered successfully', updatedTrainingClass, verificationCode, newOrder._id);
       if(verificationCode){
        response.verificationCode = verificationCode;
       }
        res.status(200).send(response);

    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).send({ error: 'Error registering user for the training class' });
    }

}

//Call this as a callback url after payment is made
exports.updatePaymentStatus = async (req, res) => {
    const { userId, trainingClassId } = req.params;

    try {
        const trainingClass = await TrainingClass.findById(trainingClassId);

        if (!trainingClass) {
            return res.status(404).send({ error: 'Training class not found' });
        }

        // Find the participant
        const participantIndex = trainingClass.participants.findIndex(p => p.user.toString() === userId);

        if (participantIndex === -1) {
            return res.status(404).send({ error: 'User not found in training class' });
        }

        // Update the payment status
        trainingClass.participants[participantIndex].paymentStatus = 'paid';
        trainingClass.participants[participantIndex].accessStatus = 'granted';

        // Save the updated training class
        await trainingClass.save();

        // Fetch the user's details
        const user = await User.findById(userId);
        if (!user) {
            console.log(`User with id ${userId} not found`);
            return res.status(404).send({ error: 'User not found' });
        }

        // Send confirmation email
        // Ensure you have a function or utility to send emails
        await sendConfirmationEmailForRegisteredTraningClass(user, trainingClass)

        res.status(200).send({ message: 'Payment status updated successfully' });

    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).send({ error: 'Error updating payment status' });
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

