const curatedCollectionController = require('../controllers/curatedCollectionController')
const { curatedCollectionUpload } = require('../middleware/upload');
const { createCuratedCollectionValidation, updateCuratedCollectionValidation } = require('../validation/curatedCollectionValidation')
const express = require('express');
const router = express.Router();

router.get('/', curatedCollectionController.getAllCuratedCollections);
router.get('/:id', curatedCollectionController.getCuratedCollectionById);
router.post('/', curatedCollectionUpload.single('bannerImage'), createCuratedCollectionValidation, curatedCollectionController.createCuratedCollection);
router.put('/:id', updateCuratedCollectionValidation, curatedCollectionController.updateCuratedCollection);
router.delete('/:id', curatedCollectionController.deleteCuratedCollection);

module.exports = router;