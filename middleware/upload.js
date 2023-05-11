require('dotenv').config();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const config = require('../config/config')
const cloudinary = config.cloudinary;

const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        // Extract the file extension from the mimetype
        const extension = file.mimetype.split('/')[1];

        // Map the extension to the format supported by Cloudinary
        const format = extension === 'jpeg' ? 'jpg' : extension;

        return {
            folder: 'hairProducts',
            format: format,
            public_id: file.originalname,
        };
    },
});
const categoryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        // Extract the file extension from the mimetype
        const extension = file.mimetype.split('/')[1];

        // Map the extension to the format supported by Cloudinary
        const format = extension === 'jpeg' ? 'jpg' : extension;

        return {
            folder: 'hairCategories',
            format: format,
            public_id: file.originalname,
        };
    },
});
const curatedCollectionStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        // Extract the file extension from the mimetype
        const extension = file.mimetype.split('/')[1];

        // Map the extension to the format supported by Cloudinary
        const format = extension === 'jpeg' ? 'jpg' : extension;

        return {
            folder: 'curatedCollections',
            format: format,
            public_id: file.originalname,
        };
    },
});


const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const extension = file.mimetype.split('/')[1];
        const format = extension === 'jpeg' ? 'jpg' : extension;

        return {
            folder: 'avatars',
            format: format,
            public_id: `${req.user._id}_${Date.now()}`,
        };
    },
});

const productUpload = multer({ storage: productStorage });
const categoryUpload = multer({ storage: categoryStorage });
const curatedCollectionUpload = multer({ storage: curatedCollectionStorage });
const avatarUpload = multer({ storage: avatarStorage });

module.exports = { productUpload, categoryUpload, avatarUpload, curatedCollectionUpload };
