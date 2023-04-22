const cloudinary = require('cloudinary').v2;

const config = {
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN
};


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


module.exports = {
    config,
    cloudinary,
}

