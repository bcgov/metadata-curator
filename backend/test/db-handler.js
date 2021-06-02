const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer({
    instance: {
        auth: false,
    }
});

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
    let uri = await mongod.getUri();
    let lastChar = uri.substring(uri.length-1);
    if (lastChar == "?"){
        uri = uri.substring(0, uri.length-1);
    }

    const mongooseOpts = {
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000
    };

    require('../db/db').init(uri);
}

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
    const conn = require('../db/db').db;
    ///await conn.dropDatabase();
    //await conn.close();
    //await mongod.stop();
}

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
    const conn = require('../db/db').db;
    const collections = conn.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
}