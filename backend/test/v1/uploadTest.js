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

let basePath = "/api/v1/datauploads/"

describe("Upload Routes", function() {
    let sandbox
    let forumResponse = [];
    let commentResponse = [];
    let focalId = -1;
    let focalObj = null;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        this.get = sandbox.stub(axios, 'get');
        this.get.callsFake(
            function(url, opts){
                
                if (url.indexOf('/v1/comment') !== -1){
                    return {
                        data: commentResponse
                    }
                }else if (url.indexOf('/v1/?name=') !== -1){
                    
                    let n = url.substring(url.indexOf('/v1/?name=')+'/v1/?name='.length);
                    for (let i=0; i<forumResponse.length; i++){
                        if (forumResponse[i].name.toString() === n.toString()){
                            return { data: [forumResponse[i]] };
                        }
                    }
                    return { data: [] }
                }else{
                    return {
                        data: forumResponse
                    }
                }
            }
        );

        this.post = sandbox.stub(axios, 'post');
        this.post.callsFake(
            function(url, body, opts){
                
                if (url.indexOf('/v1/comment') !== -1){
                    body._id = mongoose.Types.ObjectId();
                    commentResponse.push(body);
                    return { data: body };
                }else{
                    body._id = mongoose.Types.ObjectId();
                    forumResponse.push(body);
                    return { data: body };
                }
            }
        );
    })
    afterEach(async () => {
        axios.get.restore();
        axios.post.restore();
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
                focalId = res.body._id;
                focalObj = res.body;
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

    describe('PUT /id', function (){
        it('should get unauthorized', function(done){
            chai.request(server)
            .put(basePath+focalId)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        })

        it('should update an upload', function(done){
            var jwt = config.get('testJwt');

            var body = {
                description: "test update"
            }

            chai.request(server)
            .put(basePath+focalId)
            .send(body)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.description.should.equal(body.description);
                focalObj = res.body;
                focalObj.__v = focalObj.__v++;
                focalObj.files = [];
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

    describe('GET /id', function (){
        it('should get unauthorized', function(done){
            chai.request(server)
            .get(basePath+focalId)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        })

        it('should get an upload', function(done){
            var jwt = config.get('testJwt');

            chai.request(server)
            .get(basePath+focalId)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(200);
                let ok = Object.keys(focalObj);
                for (let i=0; i<ok.length; i++){
                    let k = ok[i];
                    let propType = typeof(focalObj[k]);
                    let propVal = focalObj[k];
                    
                    res.body.should.have.property(k);
                    if (propType==="object"){
                        let body = JSON.stringify(res.body[k]);
                        body.should.equal(JSON.stringify(propVal));
                    }else{
                        res.body[k].should.equal(propVal);
                    }
                    
                }
                done();
            })
        })
    })

    describe('GET /id/comments', function (){
        it('should get unauthorized', function(done){
            var url = basePath+focalId+'/comments';
            chai.request(server)
            .get(url)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        })

        it('should get 0 comments', function(done){
            var jwt = config.get('testJwt');
            var url = basePath+focalId+'/comments';

            chai.request(server)
            .get(url)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                expect(res.body).has.length(0)
                done();
            })
        });
    });

    describe('POST /id/comments', function (){
        it('should get unauthorized', function(done){
            var url = basePath+focalId+'/comments';
            chai.request(server)
            .post(url)
            .end(function(err, res){
                res.should.have.status(401);
                done();
            })
        })

        it('should create a comment', function(done){
            var url = basePath+focalId+'/comments';
            var jwt = config.get('testJwt');
            var decoded = jwtLib.decode(jwt);

            var body = {
                
            }

            chai.request(server)
            .post(url)
            .send(body)
            .set('Authorization' , 'Bearer ' + jwt)
            .end(function(err, res){
                res.should.have.status(201);
                done();
            })
        })

        it('should get 1 comment', function (done) {
            var url = basePath+focalId+'/comments';
            var jwt = config.get('testJwt');
    
            chai.request(server)
            .get(url)
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