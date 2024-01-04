const Category = require('../models/category');
const { validationResult } = require('express-validator')

exports.getAllCategories = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    try {
        const categories = await Category.find().skip(skip).limit(limit);
        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / limit);
        res.status(200).send({ categories, totalPages });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }

};


exports.getAllCategoriesWithoutLimit = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).send({ categories });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

exports.getCategoriesById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }

};


exports.createCategories = async (req, res) => {

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

    const categoryData = {
        name: req.body.name,
        description: req.body.description,
        inches: req.body.inches,
        colors: req.body.colors,
        image: req.file.path
    };

    if (['Closure', 'Frontal'].includes(req.body.name)) {
        categoryData.length = req.body.length;
    } else if (req.body.length) {
        return res.status(400).send({ error: 'Length should be provided for Closure and Frontal categories only.' });
    }

    if (req.body.name === 'Bundles') {
        categoryData.grams = req.body.grams;
    } else if (req.body.grams) {
        return res.status(400).send({ error: 'Grams should be provided for Bundles category only.' });
    }

    const category = new Category(categoryData);


    try {
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


exports.updateCategories = async (req, res) => {
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

    if (req.body.inches) {
        updateData.inches = req.body.inches;
    }

    if (req.body.colors) {
        updateData.colors = req.body.colors;
    }

    if (req.body.image) {
        updateData.image = req.body.image;
    }

    if (['Closure', 'Frontal'].includes(req.body.name)) {
        if (req.body.length) {
            updateData.length = req.body.length;
        }
    } else if (req.body.length) {
        return res.status(400).send({ error: 'Length should be provided for Closure and Frontal categories only.' });
    }

    if (req.body.name === 'Bundles') {
        if (req.body.grams) {
            updateData.grams = req.body.grams;
        }
    } else if (req.body.grams) {
        return res.status(400).send({ error: 'Grams should be provided for Bundles category only.' });
    }

    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.deleteCategories = async (req, res) => {

    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};