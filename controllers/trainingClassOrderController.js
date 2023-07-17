const TrainingClass = require('../models/trainingClass')
const User = require('../models/user')
const Service = require('../models/service')
const TrainingClassOrder = require('../models/trainingClassOrder')
const { validationResult } = require('express-validator')



exports.getTrainingClassOrderById = async (req, res) => {
    try {
        console.log('Attempting to find trainingClassOrder with id:', req.params.id);
        const trainingClassOrder = await TrainingClassOrder.findById(req.params.id)
            .populate('user')
            .populate({
                path: 'trainingClass',
                populate: [
                    {
                        path: 'type',
                        model: 'ClassTypePrice'
                    },
                    {
                        path: 'selectedServices',
                        model: 'Service'
                    }
                ]
            });
        if (!trainingClassOrder) {
            return res.status(404).json({ error: 'Training Class Order not found' });
        }
        res.status(200).json(trainingClassOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}


exports.createTrainingClassOrder = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).send({ error: 'Request body is missing' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { trainingClassId, servicesIds } = req.body;
        let userId = null;

        if (req.user) {
            userId = req.user._id; // If user is authenticated, set the userId
        }

        // Find the training class and its cost
        const trainingClass = await TrainingClass.findById(trainingClassId).populate('type');
        if (!trainingClass) {
            return res.status(404).json({ error: 'Training class not found' });
        }

        if (!trainingClass.type || typeof trainingClass.type.price !== 'number') {
            return res.status(400).json({ error: 'Training class price not set' });
        }

        //Find the services and their costs
        let totalServiceCost = 0;
        if (servicesIds && servicesIds.length > 0) {
            const services = await Service.find({ '_id': { $in: servicesIds } });
            totalServiceCost += services.reduce((total, service) => total + service.price, 0);
        }

        const totalCost = trainingClass.type.price + totalServiceCost;

        const trainingClassOrder = new TrainingClassOrder({
            user: userId,
            trainingClass: trainingClassId,
            services: servicesIds,
            totalCost: totalCost
        });

        await trainingClassOrder.save();

        res.status(201).json(trainingClassOrder)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}
