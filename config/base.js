const dotenv = require('dotenv');

const nodeEnv = process.env.NODE_ENV;
let mongoConnector;

if (nodeEnv === 'production') {
    dotenv.config({ path: `${__dirname}/prod.env` });
    mongoConnector = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(
        process.env.DB_PASSWORD
    )}@${process.env.DB_HOST}/${process.env.DB_NAME}?authSource=${
        process.env.DB_AUTH_SOURCE
    }&retryWrites=true&w=majority`;
} else {
    dotenv.config({ path: `${__dirname}/dev.env` });
    mongoConnector = `mongodb://localhost:27017/forum`;
}

module.exports = {
    secretKey: process.env.SECRET_KEY,
    dbConTimeout: process.env.DB_CONNECT_TIMEOUT,
    dbHeartBeatFq: process.env.DB_HB_FREQUENCY_MS,
    dbServerSelection: process.env.DB_SERVER_SELECTION_TIMEOUT,
    dbSocketTimeout: process.env.DB_SOCKET_TIMEOUT_MS,
    mongoUrl: mongoConnector,
    forumApiDns: process.env.API_URL,
};
