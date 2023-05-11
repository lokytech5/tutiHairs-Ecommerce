const productController = require('../controllers/productController')
const { createProductValidator, updateProductValidator } = require('../validation/productValidation')
const { productUpload } = require('../middleware/upload');
const express = require('express');
const router = express.Router();


router.get('/', productController.getAllProduct);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.post('/', productUpload.single('image'), createProductValidator, productController.createProduct);
router.put('/:id', updateProductValidator, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);


module.exports = router;