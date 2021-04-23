const cors = require('cors');

const whitelist = ['http://localhost:3000', 'http://localhost:3001', 'https://localhost:3443'];

const corsOptionsDelegate = (req, callback) => {
    let corsOptions = {}
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: true }; //false
    }
    callback(null, corsOptions);
};

exports.cors = cors();
// exports.corsWithOptions = cors(corsOptionsDelegate);
exports.corsWithOptions = cors();