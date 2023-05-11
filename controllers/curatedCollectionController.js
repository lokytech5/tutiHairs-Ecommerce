const CuratedCollection = require('../models/curatedCollection')
const { validationResult } = require('express-validator');

exports.getAllCuratedCollections = async (req, res) => {
    try {
        const collections = await CuratedCollection.find().populate('product');
        res.status(200).send({ collections });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};


exports.getCuratedCollectionById = async (req, res) => {
    try {
        const collection = await CuratedCollection.findById(req.params.id).populate('product');
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.status(200).json({ collection });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.createCuratedCollection = async (req, res) => {

    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'bannerImage is required' });
    }

    const { name, description, product } = req.body;
    const bannerImage = req.file.path;

    try {
        const newCollection = new CuratedCollection({
            name,
            description,
            bannerImage,
            product,

        });

        console.log('Saving new Collection:', newCollection);
        await newCollection.save();
        res.status(201).json({ newCollection });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.updateCuratedCollection = async (req, res) => {

    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const updateData = {};
    if (req.body.name) {
        updateData.name = req.body.name;
    }

    if (req.body.description) {
        updateData.description = req.body.description;
    }
    if (req.body.bannerImage) {
        updateData.bannerImage = req.body.bannerImage;
    }
    try {
        const updatedCollection = await CuratedCollection.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedCollection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.status(200).json({ collection });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.deleteCuratedCollection = async (req, res) => {
    try {
        const collection = await CuratedCollection.findByIdAndDelete(req.params.id);
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }
        res.status(200).send({ message: 'Curated collection deleted successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};