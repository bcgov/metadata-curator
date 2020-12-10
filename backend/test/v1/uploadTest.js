var chai = require('chai');
var config = require('config');
var chaiHttp = require('chai-http');
var server = require('../../app');
var auth = require('../../auth/auth')
var should = chai.should();
var expect = chai.expect;
var sinon = require('sinon')
var axios = require('axios')

chai.use(chaiHttp);

let basePath = "/api/v1/datauploads/"

describe("Upload Routes", function() {
    let sandbox
    beforeEach(async () => {
        sandbox = sinon.createSandbox();
    })
    afterEach(async () => {
        sandbox.restore()
    })
    describe('GET /', function () {
        // it('should get unauthorized', function(done){
        //     chai.request(server)
        //     .get(basePath)
        //     .end(function(err, res){
        //         res.should.have.status(401);
        //         done();
        //     })
        // })
        it('should get 0 uploads', function (done) {
            var jwt = config.get('testAdminJwt');
    
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
})