const Product = require('../models/product');
const { validationResult } = require('express-validator')
const { nanoid } = require('nanoid');


exports.getAllProduct = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    try {
        const product = await Product.find().skip(skip).limit(limit).populate('category');
        const totalProduct = await Product.countDocuments();
        const totalPages = Math.ceil(totalProduct / limit);
        res.status(200).send({ product, totalPages })
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error retrieving products from database' });
    }

}

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const products = await Product.find({ category: categoryId }).populate('category');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.createProduct = async (req, res) => {

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

    if (!req.body.category) {
        return res.status(400).json({ error: 'Category is required' });
    }



    const { name, description, price, category, stock } = req.body;

    //Getting image url from uploaded file
    const image = req.file.path;

    try {
        const newProduct = new Product({
            name,
            description,
            price,
            image,
            category,
            stock,
        });

        console.log('Saving product:', newProduct); // Add this line

        await newProduct.save();
        res.status(201).json(newProduct);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.updateProduct = async (req, res) => {
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

    if (req.body.price) {
        updateData.price = req.body.price;
    }

    if (req.body.image) {
        updateData.image = req.body.image;
    }

    if (req.body.category) {
        updateData.category = req.body.category;
    }

    if (req.body.stock) {
        updateData.stock = req.body.stock;
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).send({ message: 'Product deleted successfully' })

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}