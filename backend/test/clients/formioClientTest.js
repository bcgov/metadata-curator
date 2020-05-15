var chai = require('chai')
chai.use(require('chai-as-promised'))
var sinon = require('sinon')
const httpReq = require('request')
var should = chai.should()
var expect = chai.expect

var client = require('../../clients/formio_client')

describe("Formio Client", function() {
    let sandbox
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTA0NjM2NjAsImV4cCI6MTY1MDQ2MzY2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHaXZlbk5hbWUiOiJNZXRhZGF0YSIsIlN1cm5hbWUiOiJBcHByb3Zlcl8xX1VzZXJfMSIsIkVtYWlsIjoiYXJndXMrbWExX3VzZXIxQGhpZ2h3YXl0aHJlZXNvbHV0aW9ucy5jb20iLCJHcm91cHMiOlsiZXhwb3J0ZXIiLCJtZXRhZGF0YV9hcHByb3Zlcl8xX2RpcCJdfQ.ESqoLyihlc-lbfXrzfGaxYa9RWLb6lXmqcs1bghyzas"

    before(async () => {
        const res = { headers: { "x-jwt-token": token } }

        sandbox = sinon.createSandbox();

        sandbox.stub(httpReq, 'get')
        .withArgs('http://localhost:3006/form123/submission').callsFake((o,b,cb) => {
            cb(null, res, {name:"abc"})
        })
        .withArgs('http://localhost:3006/form123/submission/00').callsFake((o,b,cb) => {
            cb(null, res, {name:"abc"})
        })
        .withArgs('http://localhost:3006/form').callsFake((o,b,cb) => {
            cb(null, res, [{_id:"01", name:"myform"}])
        })
        .withArgs('http://localhost:3006/myform').callsFake((o,b,cb) => {
            cb(null, res, {name:"myform"})
        })

        sandbox.stub(httpReq, 'post')
        .withArgs('http://localhost:3006/user/login').callsFake((o,b,cb) => {
            cb(null, res, null)
        })
        .withArgs('http://localhost:3006/form').callsFake((o,b,cb) => {
            cb(null, res, {result:"ok"})
        })
        .withArgs('http://localhost:3006/form123/submission').callsFake((o,b,cb) => {
            cb(null, res, {_id:"02"})
        })

        sandbox.stub(httpReq, 'put')
        .withArgs('http://localhost:3006/form/myform').callsFake((o,b,cb) => {
            cb(null, res, {result:"ok"})
        })
        .withArgs('http://localhost:3006/form123/submission/02').callsFake((o,b,cb) => {
            cb(null, res, {result:"ok"})
        })

        sandbox.stub(httpReq, 'delete')
        .withArgs('http://localhost:3006/myform').callsFake((o,b,cb) => {
            cb(null, res, {result:"ok"})
        })
        .withArgs('http://localhost:3006/form123/submission/02').callsFake((o,b,cb) => {
            cb(null, res, {result:"ok"})
        })
    })
    after(async () => {
        sandbox.restore()
    })

    it('should succeed getting submissions', function (done) {
        client.getSubmissions('form123', (subm, body) => {
            expect(body.name).equals('abc')
            done()
        })
    })

    it('should succeed get a submission', function (done) {
        client.getSubmission('form123', '00', (subm, body) => {
            expect(body.name).equals('abc')
            done()
        })
    })

    it('should succeed posting a submission', function (done) {
        client.postSubmission('form123', {}, (err, body) => {
            expect(body).to.be.an('object')
            expect(body._id).equals('02')
            done()
        })
    })

    it('should succeed updating an existing submission', function (done) {
        client.putSubmission('form123', '02', {}, (err, body) => {
            expect(body).to.be.an('object')
            expect(body.result).equals('ok')
            done()
        })
    })

    it('should succeed deleting a submission', function (done) {
        client.deleteSubmission('form123', '02', (err, body) => {
            expect(body).to.be.an('object')
            expect(body.result).equals('ok')
            done()
        })
    })

    it('should succeed get forms', function (done) {
        client.getForms((err, body) => {
            console.log("RESULT = "+err)
            console.log("RESULT = "+body)
            expect(body).to.be.an('array')
            expect(body[0].name).equals('myform')
            done()
        })
    })

    it('should succeed get a form', function (done) {
        client.getForm('myform', (err, body) => {
            expect(body).to.be.an('object')
            expect(body.name).equals('myform')
            done()
        })
    })

    it('should succeed posting a form', function (done) {
        client.postForm({}, (err, body) => {
            expect(body).to.be.an('object')
            expect(body.result).equals('ok')
            done()
        })
    })

    it('should succeed updating an existing form', function (done) {
        client.putForm('myform', {}, (err, body) => {
            expect(body).to.be.an('object')
            expect(body.result).equals('ok')
            done()
        })
    })

    it('should succeed deleting a form', function (done) {
        client.deleteForm('myform', (err, body) => {
            expect(body).to.be.an('object')
            expect(body.result).equals('ok')
            done()
        })
    })

})