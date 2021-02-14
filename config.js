require('dotenv').config();
module.exports = {
    'secretKey': process.env.SECRET_KEY,
    'mongoUrl': 'mongodb://localhost:27017/kupboard'
}