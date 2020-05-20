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
    })

})