var notification = function(_config = null){
    //var config = _config == null ? require('config') : _config;
    var config = require('config');

    var notifications = {};
    var fs = require('fs');
    const url = require('url');

    var path = require('path');
    var template = fs.readFileSync(path.resolve(__dirname, 'emailTemplate.html'), 'utf8');

    var setTemplate = function(dataUpload, user, triggeringUser, templateName){

        if (typeof(templateName) === "undefined"){
            templateName = "emailTemplate.html";
        }

        var email = "";
        if (templateName === "emailSubmitTemplate.html"){
            email = submitTemplate;
        }else if (templateName === "emailTemplate.html"){
            email = template;
        }else{
            try{
                email = fs.readFileSync(path.resolve(__dirname, templateName), 'utf8');
            }catch(ex){
                email = "";
            }
        }

        const baseURL = config.get("frontend");
        const dataUploadPartialUrl = "/dataUpload/" + dataUpload._id;
        const dataUploadURL = url.resolve(baseURL, dataUploadPartialUrl);
        const dataUploadName = dataUpload.name;
        const dataUploadId = dataUpload._id.toString();

        email = email.replace("{{name}}", user['name']);
        email = email.replace("{{updater}}", triggeringUser['displayName']);
        email = email.replace("{{baseURL}}", baseURL);
        email = email.replace("{{dataUploadURL}}", dataUploadURL);
        email = email.replace("{{dataUploadName}}", dataUploadName);
        email = email.replace("{{dataUploadId}}", dataUploadId);

        return email;
    };


    //user is the user making the change
    notifications.notify = function(dataUpload, user){

        var logger = require('npmlog');

        if (!config.has('email')){
            logger.debug("Notifications[email] - Triggered but not configured");
            return;
        }

        var emailConfig = config.get('email');
        if (!emailConfig.enabled){
            logger.debug("Notifications[email] - Triggered but not enabled");
            return;
        }

        if (config.has('alwaysNotifyList')){
            var emailList = config.get('alwaysNotifyList')[user.organization];
            for (let i=0; i<emailList.length; i++){
                sendEmail(dataUpload, {name: emailList[i].name, email: emailList[i].email}, user, "emailTemplate.html");
            }
        }

        logger.verbose("Notification[email] triggered", user);

    };

    function sendEmail(dataUpload, userInfo, user, templateName){
        var logger = require('npmlog');

        var emailConfig = config.get('email');
        var emailContent = setTemplate(dataUpload, userInfo, user, templateName);

        var emailPort = (typeof(emailConfig.port) === "undefined") ? 25 : emailConfig.port;
        var emailSecure = (typeof(emailConfig.secure) === "undefined") ? false : emailConfig.secure;

        var transportOpts = {
            host: emailConfig.service,
            port: emailPort,
            secure: emailSecure
        };

        if (!emailSecure){
            transportOpts.tls = {
                rejectUnauthorized: false
            }
        }

        if ( (emailConfig.user !== "") && (emailConfig.pass !== "") ){
            transportOpts.auth = {
                user: emailConfig.user,
                pass: emailConfig.pass
            }
        }

        var nodemailer = require("nodemailer");
        var transporter = nodemailer.createTransport(transportOpts);

        var mailOptions = {
            from: emailConfig.from,
            to: userInfo.email,
            subject: "Data Upload Update",
            html: emailContent
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                logger.error("Error sending email to ", mailOptions.to, error);
                return;
            }
            logger.debug("Email sent: " + info.response);
        });
    }

    return notifications;
}

module.exports = notification;
