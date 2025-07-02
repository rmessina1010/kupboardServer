require('dotenv').config();
const mongoUrl = process.env.RENDER === 'true' ?
        "mongodb+srv://"+process.env.SECRET_USER+":"+process.env.SECRET_KEY+"@cluster0.acxx5xp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" 
        :'mongodb://localhost:27017/kupboard';

module.exports = {
    'secretKey': process.env.SECRET_KEY,
    'secretUser':process.env.SECRET_USER,
    'mongoUrl': mongoUrl
}