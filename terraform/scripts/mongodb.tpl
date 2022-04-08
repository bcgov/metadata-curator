db.createUser(
    {
        user: "${MONGO_USERNAME}",
        pwd: "${MONGO_PASSWORD}",
        roles: [ "readWrite" ]
    }
);

use oc_db;

db.config.insertOne({
    key: "enabledPhase",
    value: "3"
})
