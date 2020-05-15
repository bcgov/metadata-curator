var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var sinon = require('sinon')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

//sinon.stub(config, 'get').returns("a")

var nodemailer = require("nodemailer");
sinon.stub(nodemailer, 'createTransport').returns({
    sendMail: function(mailOptions, callback) {
        callback(null, null);
    }
});

describe("Notifications Emails", function() {
    const config = () => {
        const hardcoded = {
            frontend: "http://localhost",
            alwaysNotifyList: {'orgX':[{
                name: "user",
                email: "user@local"
            }]},
            email: {
                enabled: true,
                service: "smtp.gmail.com",
                secure: true,
                port: 465,
                user: "{user}",
                pass: "{password}",
                from: "{email}",
                subject: "Data Upload Update"
            }
        };
        return {
            has: function(v) { return true; },
            get: function(k) { return hardcoded[k]; }
        }
    }

    const email = require('../../notifications/email/index')(config())
        
    it('should succeed with valid template', function (done) {
        const dataUpload = {name: "upload", _id: ObjectId("0000000009c5d71ee7600000")}
        const user = {organization: "orgX"}
        email.notify(dataUpload, user)
        done()
    })
})