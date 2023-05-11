const auth = require('../middleware/auth')
const admin = require('../middleware/admin');
const categoryController = require('../controllers/categoryController');
const { createCategoryValidator, updateCategoryValidator } = require('../validation/categoryValidation');
const { categoryUpload } = require('../middleware/upload');
const express = require('express');
const router = express.Router();


router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoriesById);
router.post('/', categoryUpload.single('image'), createCategoryValidator, categoryController.createCategories);
router.put('/:id', updateCategoryValidator, categoryController.updateCategories);
router.delete('/:id', categoryController.deleteCategories);


module.exports = router;