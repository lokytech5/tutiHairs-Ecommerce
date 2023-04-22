const ClassTypePrice = require('../models/classTypePrice');
const { validationResult } = require('express-validator');


exports.getAllClassTypePrices = async (req, res) => {

    try {
        const classTypePrices = await ClassTypePrice.find();
        res.status(200).send({ classTypePrices });

    } catch (error) {
        res.status(500).send({ error: 'Error retrieving ClassTypePrices from the database' });
    }
};


exports.getClassTypePriceById = async (req, res) => {
    try {
        const classTypePrice = await ClassTypePrice.findById(req.params.id);

        if (!classTypePrice) {
            return res.status(404).send({ error: 'ClassTypePrice not found' });
        }

        res.status(200).send({ classTypePrice });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


exports.createClassTypePrice = async (req, res) => {

    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { classType, price } = req.body;

        const classTypePrice = new ClassTypePrice({
            classType,
            price
        });

        await classTypePrice.save();
        res.status(201).send({ message: 'ClassTypePrice created successfully', classTypePrice });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


exports.updateClassTypePrice = async (req, res) => {

    const updateData = {};

    if (req.body.classType) {
        updateData.classType = req.body.classType;
    }

    if (req.body.price) {
        updateData.price = req.body.price;
    }

    try {
        const classTypePrice = await ClassTypePrice.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!classTypePrice) {
            return res.status(404).send({ error: 'ClassTypePrice not found' });
        }

        res.status(200).send({ message: 'ClassTypePrice updated successfully', classTypePrice });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


exports.deleteClassTypePrice = async (req, res) => {
    try {
        const classTypePrice = await ClassTypePrice.findByIdAndDelete(req.params.id);

        if (!classTypePrice) {
            return res.status(404).send({ error: 'ClassTypePrice not found' });
        }

        res.status(200).send({ message: 'ClassTypePrice deleted successfully', classTypePrice });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};




