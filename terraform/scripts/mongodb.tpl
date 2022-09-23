db.createUser(
    {
        user: "${MONGO_USERNAME}",
        pwd: "${MONGO_PASSWORD}",
        roles: [ "readWrite" ]
    }
);

db.config.insertOne({
    key: "enabledPhase",
    value: "3"
});

db.option.insertOne({
    type: "ministry_organization",
    "values" : [ 
        {
            "text" : "test",
            "value" : "test",
        }
    ]
});
