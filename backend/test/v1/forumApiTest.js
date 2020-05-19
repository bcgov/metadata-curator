var chai = require('chai');
var config = require('config');
var chaiHttp = require('chai-http');
var server = require('../../app');
var should = chai.should();
var expect = chai.expect;
var sinon = require('sinon')
var axios = require('axios')

chai.use(chaiHttp);

const dbHandler = require('../db-handler')

before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())

describe("Forum API Bridge", function() {
    let sandbox
    before(async () => {
        sandbox = sinon.createSandbox();
        sandbox.stub(axios, 'get').returns({data: [{_id:"00",name:"someperm"}]})
        sandbox.stub(axios, 'put').returns({data: [{_id:"00"}]})
        sandbox.stub(axios, 'post').returns({data: [{_id:"00"}]})
    })
    after(async () => {
        sandbox.restore()
    })
/*
    describe('/GET v1/forum/permissions', function () {
        it('should get permissions', function (done) {
            var jwt = config.get('testJwt');

            chai.request(server)
            .get('/api/v1/forum/permissions')
            .set('Authorization' , 'Bearer ' + jwt)
            .end(async function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                expect(res.body).has.length(1)
                expect(res.body[0]).has.a.property('_id')
                done();
            })
        })
    })

    describe('/PUT v1/forum/permissions/:id', function () {
        it('should succeed updating a permission', function (done) {
            var jwt = config.get('testJwt');

            const body = `
                {
                }
            `

            chai.request(server)
            .put('/api/v1/forum/permission/00')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                expect(res.body).has.length(1)
                expect(res.body[0]).has.a.property('_id')
                done();
            })
        })
    })

    describe('/POST v1/forum/permissions', function () {
        it('should succeed add a permission', function (done) {
            var jwt = config.get('testJwt');

            const body = `
                {
                }
            `

            chai.request(server)
            .post('/api/v1/forum/permission')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                res.should.have.status(200);
                expect(res.body).to.be.an('array')
                expect(res.body).has.length(1)
                expect(res.body[0]).has.a.property('_id')
                done();
            })
        })
    })
*/
})