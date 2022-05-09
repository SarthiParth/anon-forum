const mongoose = require('mongoose');
const config = require('./base');

// Connect to the database and check if the connection
// got established correctly
module.exports.dbInit = (callback) => {
    // eslint-disable-next-line no-console
    console.log('Database init process starting...');
    mongoose
        .connect(config.mongoUrl, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            keepAlive: true,
            connectTimeoutMS: config.dbConTimeout,
            heartbeatFrequencyMS: config.dbHeartBeatFq,
            serverSelectionTimeoutMS: config.dbServerSelection,
            socketTimeoutMS: config.dbSocketTimeout,
        })
        .then((db) => {
            // eslint-disable-next-line no-console
            console.log('Database connection established successfully');
            // Bind connection to error event (to get notification of connection errors)
            db.connection.on('error', () =>
                console.error('MongoDB connection error:')
            );
            db.connection.on('disconnected', () =>
                console.error('FATAL: MongoDB disconnected!')
            );
            db.connection.on('connected', () =>
                // eslint-disable-next-line no-console
                console.log('INFO: MongoDB connected!')
            );
            callback(null, true);
        })
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(
                `Something went wrong while establishing database connection: ${err}`
            );
            callback(err, false);
        });
};
