require('dotenv').config();
const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const Category = require('./routes/categorys')
const Product = require('./routes/products')
const User = require('./routes/users')
const auth = require('./routes/auth')
const TrainingClasses = require('./routes/trainingClasses')
const ClassTypePrice = require('./routes/classTypePrices')
const Orders = require('./routes/orders')
const Cart = require('./routes/shoppingCarts')
const Payment = require('./routes/payment')
const curatedCollection = require('./routes/curatedCollection')
const Services = require('./routes/services')
const TrainingClassOrder = require('./routes/trainingClassOrder')
const app = express();

const allowedOrigins = ['https://tuti-app-five.vercel.app', 'http://localhost:3000'];


//*Initalizing body parser here
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

//*calling each route here
app.use(express.json());
app.use('/api/categorys', Category);
app.use('/api/products', Product);
app.use('/api/users', User);
app.use('/api/auth', auth);
app.use('/api/trainingClasses', TrainingClasses);
app.use('/api/classTypePrices', ClassTypePrice);
app.use('/api/orders', Orders);
app.use('/api/shoppingCart', Cart);
app.use('/api/payments', Payment);
app.use('/api/curatedCollection', curatedCollection);
app.use('/api/services', Services);
app.use('/api/trainingClassOrders', TrainingClassOrder);


// Connecting to MongoDB database
// mongoose.set('strictQuery', true);
// mongoose.connect("mongodb://127.0.0.1:27017/tutiEcommerceDB", { useNewUrlParser: true })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch((err) => console.log('could not connect to MongoDB', err));

    //*Connecting to MongoDB database server
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('could not connect to MongoDB', err));

app.use(express.static('public'));


const port = process.env.PORT || 8000;
app.listen(port, function () {
    console.log(`Listening on port ${port}`);
})