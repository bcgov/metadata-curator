var chai = require('chai');
var config = require('config');
var chaiHttp = require('chai-http');
var server = require('../../app');
var expect = chai.expect;
var should = chai.should();
var sinon = require('sinon')
var axios = require('axios')
const jwtLib = require('jsonwebtoken');
const mongoose = require('mongoose');

const dbHandler = require('../db-handler');

chai.use(chaiHttp);

let basePath = "/api/v1/repobranches/"

describe("Branch Routes", function() {
    let sandbox;
    let focalId = -1;
    let repoId = -1;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
    })

    afterEach(async () => {
        sandbox.restore()
    })
    
    before(async () => {
        await dbHandler.connect()
        //pre create a repo
        var jwt = config.get('testJwt');

        var body = {
            name: "test repo"
        }
        let u = "/api/v1/repos/"

        await chai.request(server)
        .post(u)
        .send(body)
        .set('Authorization' , 'Bearer ' + jwt)
        .then(function(resp){
            repoId = resp.body.id;
        })
    });
    
    after(async () => {
        await dbHandler.clearDatabase()
        await dbHandler.closeDatabase()
    });

    describe('GET /', function () {
        it('should get unauthorized', function(done){
            chai.request(server)
            .get(basePath)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        })

        it('should get 0 branches', function (done) {
            var jwt = config.get('testJwt');
    
            chai.request(server)
            .get(basePath)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                expect(res.body).has.length(0)
                done();
            })
        })
    })

    describe('POST /', function (){
        it('should get unauthorized', function(done){
            chai.request(server)
            .post(basePath)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        })

        it('should fail without a name', function(done){
            var jwt = config.get('testJwt');
            let url = basePath+repoId+"/branches"

            chai.request(server)
            .post(url)
            .send({})
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(400);
                res.body.should.have.property('error');
                done();
            })
        })

        it('should create a branch', function(done){
            var jwt = config.get('testJwt');
            let url = basePath+repoId+"/branches"


            var body = {
                name: "test repo",
                upload_id: repoId,
                type: "standard",
                description: "desc"
            }

            chai.request(server)
            .post(url)
            .send(body)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(201);
                res.body.should.have.property('id');
                focalId = res.body.id;
                done();
            })
        })

        it('should get 1 branch', function (done) {
            var jwt = config.get('testJwt');
    
            chai.request(server)
            .get(basePath)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body).has.length(1);
                done();
            })
        })
    });

    describe('PUT /', function (){
        
        it('should get unauthorized', function(done){
            let url = basePath + focalId;
            chai.request(server)
            .put(url)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        });

        it('should update a branch', function(done){
            let url = basePath + focalId;
            var jwt = config.get('testJwt');
            var decoded = jwtLib.decode(jwt);

            var body = {
                description: "updated"
            }

            chai.request(server)
            .put(url)
            .send(body)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.have.property('description');
                res.body.description.should.equal(body.description);
                done();
            })
        })
    });

    describe('GET /:id', function () {
        it('should get unauthorized', function(done){
            chai.request(server)
            .get(basePath+focalId)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        })

        it('should get a branch', function (done) {
            var jwt = config.get('testJwt');
    
            chai.request(server)
            .get(basePath+focalId)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('object')
                res.body.should.have.property('_id');
                res.body._id.should.equal(focalId);
                done();
            })
        })
    })

    describe('DELETE /:id', function () {
        it('should get unauthorized', function(done){
            chai.request(server)
            .delete(basePath+focalId)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        })

        it('should get not found', function(done){
            var jwt = config.get('testJwt');

            chai.request(server)
            .delete(basePath+focalId)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(404);
                done();
            })
        })

        it('should delete a branch', function (done) {
            var jwt = config.get('testAdminJwt');
    
            chai.request(server)
            .delete(basePath+focalId)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('object')
                res.body.should.have.property('status');
                res.body.status.should.equal("ok");
                done();
            })
        });

        it('should get 0 branches', function (done) {
            var jwt = config.get('testJwt');
    
            chai.request(server)
            .get(basePath)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                expect(res.body).has.length(0)
                done();
            })
        });
    })
})