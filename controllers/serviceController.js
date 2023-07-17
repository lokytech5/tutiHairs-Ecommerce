const Service = require('../models/service')
const { validationResult } = require('express-validator')


exports.getAllServices = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    try {
        const services = await Service.find().skip(skip).limit(limit);
        const totalService = await Service.countDocuments();
        const totalPages = Math.ceil(totalService / limit);
        res.status(200).send({ services, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

exports.createServices = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { serviceName, price, description } = req.body;


    try {
        const newService = new Service({
            serviceName,
            price,
            description,
        })

        await newService.save();
        res.status(201).json(newService);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}