const cors = require('cors');
const config = require('../config/base');

const whitelist = [config.forumApiDns];

const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
        callback(null, corsOptions);
    } else {
        corsOptions = { origin: false };
        callback(
            new Error('Origin not whitelisted, denied by CORS'),
            corsOptions
        );
    }
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
