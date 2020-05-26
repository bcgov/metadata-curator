var chai = require('chai');
var config = require('config');
var chaiHttp = require('chai-http');
var server = require('../../app');
var should = chai.should();
var expect = chai.expect;
var sinon = require('sinon')
var axios = require('axios')

chai.use(chaiHttp);

const formio = require('../../clients/formio_client');

describe("Formio Routes", function() {
    let sandbox
    beforeEach(async () => {
        sandbox = sinon.createSandbox();
    })
    afterEach(async () => {
        sandbox.restore()
    })
    describe('/GET forms', function () {
        it('should get forms', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'getForms').callsFake((cb) => {
                return cb(null, '[{"_id":"00","name":"formA"}]');
            })
    
            chai.request(server)
            .get('/api/v1/formio/forms')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                expect(res.body).has.length(1)
                expect(res.body[0]).has.a.property('_id')
                done();
            })
        })
    })

    describe('/GET form details', function () {

        it('should fail to get forms', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'getForms').callsFake((cb) => {
                return cb("Error");
            })
    
            chai.request(server)
            .get('/api/v1/formio/forms')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(500);
                expect(res.body).to.be.an('object')
                expect(res.body).has.a.property('error')
                done();
            })
        })

        it('should get a particular form', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'getForm').callsFake((name, cb) => {
                return cb(null, '{"_id":"00","name":"' + name + '"}');
            })
    
            chai.request(server)
            .get('/api/v1/formio/form/myform')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('object')
                expect(res.body).has.a.property('_id')
                expect(res.body['name']).is.equal("myform")
                done();
            })
        })        
    })

    describe('Manage forms', function () {
        it('should modify a form', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'putForm').callsFake((name, body, cb) => {
                return cb(null, {});
            })
    
            chai.request(server)
            .put('/api/v1/formio/form/myform')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('object')
                done();
            })
        })
        it('should delete a form', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'deleteForm').callsFake((name, cb) => {
                return cb(null, {});
            })
    
            chai.request(server)
            .delete('/api/v1/formio/form/myform')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('object')
                done();
            })
        })        
        it('should add a form', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'postForm').callsFake((body, cb) => {
                return cb(null, {});
            })
    
            chai.request(server)
            .post('/api/v1/formio/form')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('object')
                done();
            })
        })        
    })

    describe('Manage form submissions', function () {
        it('should get a form submission', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'getSubmission').callsFake((name, subid, cb) => {
                return cb(null, '{}');
            })
    
            chai.request(server)
            .get('/api/v1/formio/form/myform/submission/01')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('object')
                done();
            })
        })
        it('should create a form submission', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'postSubmission').callsFake((name, body, cb) => {
                return cb(null, '{}');
            })
    
            chai.request(server)
            .post('/api/v1/formio/form/myform/submission')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(201);
                expect(res.body).to.be.an('object')
                done();
            })
        })
        it('should fail with an invalid form submission', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'postSubmission').callsFake((name, body, cb) => {
                return cb(null, {name: "ValidationError"});
            })
    
            chai.request(server)
            .post('/api/v1/formio/form/myform/submission')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(500);
                expect(res.body).to.be.an('object')
                expect(res.body.error).to.equal("Critical form validation error")
                done();
            })
        })
        it('should fail with a formio hard error for post', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'postSubmission').callsFake((name, body, cb) => {
                return cb("Bad Error", null);
            })
    
            chai.request(server)
            .post('/api/v1/formio/form/myform/submission')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(500);
                expect(res.body).to.be.an('object')
                expect(res.body.error).to.equal("Bad Error")
                done();
            })
        })        

        it('should update a form submission', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'putSubmission').callsFake((name, subid, body, cb) => {
                return cb(null, '{}');
            })
    
            chai.request(server)
            .put('/api/v1/formio/form/myform/submission/01')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('object')
                done();
            })
        })
        it('should fail with an invalid form submission update', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'putSubmission').callsFake((name, subid, body, cb) => {
                return cb(null, {name: "ValidationError"});
            })
    
            chai.request(server)
            .put('/api/v1/formio/form/myform/submission/01')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(500);
                expect(res.body).to.be.an('object')
                expect(res.body.error).to.equal("Critical form validation error")
                done();
            })
        })        
        it('should fail with a formio hard error', function (done) {
            var jwt = config.get('testJwt');

            sandbox.stub(formio, 'putSubmission').callsFake((name, subid, body, cb) => {
                return cb("Bad Error", null);
            })
    
            chai.request(server)
            .put('/api/v1/formio/form/myform/submission/01')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(500);
                expect(res.body).to.be.an('object')
                expect(res.body.error).to.equal("Bad Error")
                done();
            })
        })        
    })
})