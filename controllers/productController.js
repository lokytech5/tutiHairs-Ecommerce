const Product = require('../models/product');
const User = require('../models/user');
const Category = require('../models/category');
const ProductView = require('../models/productView')
const { validationResult } = require('express-validator')


const determineSortOrder = (sortOrder) => {
    if (sortOrder === "asc") {
        return { price: 1 }; // Ascending
    } else if (sortOrder === "desc") {
        return { price: -1 }; // Descending
    }
    return {};
}

const determineCategoryQuery = async (category, size) => {
    if (size) {
        const categoriesWithSize = await Category.find({ inches: size });
        const categoryIdsWithSize = categoriesWithSize.map(cat => cat._id);

        if (category) {
            if (!categoryIdsWithSize.includes(category)) {
                return null;
            }
            return category;
        }
        return { $in: categoryIdsWithSize };
    }
    return category;
}

exports.getAllProduct = async (req, res) => {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || '';
    const category = req.query.category;
    const size = parseInt(req.query.size);
    const sortOrder = req.query.sortOrder;

    const sortCriteria = determineSortOrder(sortOrder);

    // Create a query object for filtering
    const query = { name: { $regex: search, $options: 'i' } };

    const categoryQuery = await determineCategoryQuery(category, size);
    if (categoryQuery === null) {
        return res.status(200).send({ product: [], totalPages: 0 });
    }
    if (categoryQuery) {
        query.category = categoryQuery;
    }

    try {
        const product = await Product.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sortCriteria)
            .populate('category');
        const totalProduct = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProduct / limit);
        res.status(200).send({ product, totalPages });
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving products from database' });
    }
}


exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find or create the ProductView document for this product
        let productView = await ProductView.findOne({ product: product._id });
        if (!productView) {
            productView = new ProductView({ product: product._id });
        }

        // Increment the view count and save the ProductView document
        productView.viewCount++;
        await productView.save();

        const productData = product.toObject(); // Convert the product document to a regular JavaScript object
        productData.viewCount = productView.viewCount; // Add the view count to the product data

        res.status(200).json(productData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getLatestProduct = async (req, res) => {
    const skipCount = parseInt(req.query.skip) || 0;
    const itemsPerPage = 4;  // Or whatever limit you'd like

    try {
        const totalItems = await Product.countDocuments();
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        const latestProducts = await Product.find()
            .sort({ createdAt: -1 })
            .skip(skipCount)
            .limit(itemsPerPage);
        
        if (latestProducts.length === 0) {
            return res.status(404).json({ error: 'No products found' });
        }

        res.status(200).json({ latestProducts, totalPages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




exports.getProductViewCount = async (req, res) => {
    try {
        const productView = await ProductView.findOne({ product: req.params.id });
        if (!productView) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ viewCount: productView.viewCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




exports.getProductsByCategory = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    try {
        const categoryId = req.params.categoryId;
        const products = await Product.find({ category: categoryId }).skip(skip).limit(limit).populate('category');
        const totalProducts = await Product.countDocuments({ category: categoryId });
        const totalPages = Math.ceil(totalProducts / limit);
        res.status(200).json({ products, totalPages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductsByCategoryWithOutLimit = async (req, res) => {
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


exports.addProductReview = async (req, res) => {

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const userId = req.user._id;
        const review = req.body.reviewText;
        const rating = req.body.rating;

        // Check if user has already reviewed the product
        const existingReview = product.reviews.find(review => review.userId.toString() === userId);
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }

        // Assuming you have a User model and that the user's username is stored in the 'username' field
        const reviewer = await User.findById(userId);
        if (!reviewer) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newReviewIndex = product.reviews.push({ userId, username: reviewer.username, review, rating }) - 1;

        let ratingSum = 0;
        for (let i = 0; i < product.reviews.length; i++) {
            ratingSum += product.reviews[i].rating;
        }

        product.averageRating = product.reviews.length > 0 ? ratingSum / product.reviews.length : 0;

        await product.save();

        const newReview = product.reviews[newReviewIndex];

        res.status(200).json(newReview);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.deleteProductReview = async (req, res) => {
    try {

        const productId = req.params.id;
        const reviewId = req.params.reviewId;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find the index of the review in the product's reviews array
        const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);
        // If the review was not found in the product's reviews array, send an error response
        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Remove the review from the product's reviews array
        product.reviews.splice(reviewIndex, 1);
        // Save the product document
        await product.save();

        // Send a success response
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        // If there was an error, send an error response
        res.status(500).json({ message: 'Server error' });
    }
};





