var notification = function(db){
    const email = require('./email')(db);

    var notifications = {};

    notifications.notify = function(dataUpload, user){
        email.notify(dataUpload, user);
    };

    return notifications;
}

module.exports = notification;
