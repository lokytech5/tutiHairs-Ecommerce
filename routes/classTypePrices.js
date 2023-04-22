const classTypePrice = require('../controllers/classTypeController')
const { createClassTypePriceValidator,
    updateClassTypePriceValidator } = require('../validation/classTypePriceValidation')
const express = require('express');
const router = express.Router();

router.get('/', classTypePrice.getAllClassTypePrices);
router.get('/:id', classTypePrice.getClassTypePriceById);
router.post('/', createClassTypePriceValidator, classTypePrice.createClassTypePrice);
router.put('/:id', updateClassTypePriceValidator, classTypePrice.updateClassTypePrice);
router.delete('/:id', classTypePrice.deleteClassTypePrice);


module.exports = router;