var chai = require('chai');
var config = require('config');
var chaiHttp = require('chai-http');
var server = require('../../app');
var expect = chai.expect;
var should = chai.should();
var sinon = require('sinon')
var axios = require('axios')
const jwtLib = require('jsonwebtoken');

const dbHandler = require('../db-handler');

chai.use(chaiHttp);

let basePath = "/api/v1/datauploads/"

describe("Upload Routes", function() {
    let sandbox
    let forumResponse = [];
    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        this.get = sandbox.stub(axios, 'get');
        this.get.resolves({
            data: forumResponse
        });
    })
    afterEach(async () => {
        axios.get.restore();
        sandbox.restore()
    })
    before(async () => {
        await dbHandler.connect()
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

        it('should get 0 uploads', function (done) {
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

            

            chai.request(server)
            .post(basePath)
            .send({})
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(400);
                done();
            })
        })

        it('should create an upload', function(done){
            var jwt = config.get('testJwt');
            var decoded = jwtLib.decode(jwt);

            var body = {
                name: "test upload"
            }

            chai.request(server)
            .post(basePath)
            .send(body)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                forumResponse.push({
                    _id: res.body.topic_id, 
                    name: res.body._id, 
                    parent_id: -1,
                    author_groups: [decoded.groups]
                });
                res.should.have.status(201);
                done();
            })
        })

        it('should get 1 uploads', function (done) {
            var jwt = config.get('testJwt');
    
            chai.request(server)
            .get(basePath)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                expect(res.body).has.length(1);
                done();
            })
        })
    })
})