const productController = require('../controllers/productController')
const { createProductValidator, updateProductValidator } = require('../validation/productValidation')
const { productUpload } = require('../middleware/upload');
const auth = require('../middleware/auth')
const express = require('express');
const router = express.Router();


router.get('/', productController.getAllProduct);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/category/no-limit/:categoryId', productController.getProductsByCategoryWithOutLimit);
router.get('/latest', productController.getLatestProduct);
router.get('/:id', productController.getProductById);
router.post('/', productUpload.single('image'), createProductValidator, productController.createProduct);
router.put('/:id', updateProductValidator, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

router.post('/:id/review', auth, productController.addProductReview)
router.delete('/:id/review/:reviewId', auth, productController.deleteProductReview)

module.exports = router;