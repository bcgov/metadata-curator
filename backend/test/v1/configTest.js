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

let basePath = "/api/v1/config/"

describe("Config Routes", function() {
    let focalId = -1;

    before(async () => {
        await dbHandler.connect();
    });

    after(async () => {
        await dbHandler.clearDatabase()
        await dbHandler.closeDatabase()
    });

    describe('GET /', function () {

        it('should get 0 config', function (done) {
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
        });

        it('should 404 with  without an admin key', function(done){
            var jwt = config.get('testJwt');
            chai.request(server)
            .post(basePath)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(404);
                done();
            })
        })

        it('should fail without a key', function(done){
            var jwt = config.get('testAdminJwt');

            chai.request(server)
            .post(basePath)
            .send({})
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(400);
                res.body.should.have.property('error');
                done();
            })
        });

        it('should fail without a value', function(done){
            var jwt = config.get('testAdminJwt');

            let body = {
                key: "test"
            }

            chai.request(server)
            .post(basePath)
            .send(body)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(400);
                res.body.should.have.property('error');
                done();
            })
        });

        it('should create a config', function(done){
            var jwt = config.get('testAdminJwt');

            let body = {
                key: "test",
                value: "val"
            }

            chai.request(server)
            .post(basePath)
            .send(body)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(201);
                res.body.should.have.property('_id');
                res.body.should.have.property('key');
                focalId = res.body.key;
                done();
            })
        })

        it('should get 1 config', function (done) {
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

        it('should 404 without admin credentials', function(done){
            let url = basePath + focalId;
            var jwt = config.get('testJwt');

            var body = {
                value: "new val"
            }

            chai.request(server)
            .put(url)
            .send(body)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(404);
                done();
            })
        })

        it('should update a config', function(done){
            let url = basePath + focalId;
            var jwt = config.get('testAdminJwt');

            var body = {
                value: "new val"
            }

            chai.request(server)
            .put(url)
            .send(body)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.should.have.property('value');
                res.body.value.should.equal(body.value);
                done();
            })
        })
    });

    describe('GET /:key', function () {

        it('should get a config', function (done) {
            var jwt = config.get('testJwt');

            chai.request(server)
            .get(basePath+focalId)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('object')
                res.body.should.have.property('key');
                res.body.key.should.equal(focalId);
                done();
            })
        })
    })

    describe('DELETE /:key', function () {
        it('should get unauthorized', function(done){
            chai.request(server)
            .delete(basePath+focalId)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        })

        it('should get not found with non admin key', function(done){
            var jwt = config.get('testJwt');

            chai.request(server)
            .delete(basePath+focalId)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(404);
                done();
            })
        })

        it('should delete a config', function (done) {
            var jwt = config.get('testAdminJwt');

            chai.request(server)
            .delete(basePath+focalId)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(204);
                done();
            })
        });

        it('should get 0 configs', function (done) {
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