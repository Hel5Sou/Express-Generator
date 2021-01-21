const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443']; //povolene servery
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin')) !== -1) { //checking calue of request value called Origin and checking if it's on the whitelist
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors(); //returning the middleware with the wild card as it's value
exports.corsWithOptions = cors(corsOptionsDelegate); // return mw - if the infoming request bellongs to whitelist