var chai = require('chai');
var config = require('config');
var chaiHttp = require('chai-http');
var server = require('../../app');
var should = chai.should();
var expect = chai.expect;

chai.use(chaiHttp);
//chai.use(require('chai-as-promised'))

const dbHandler = require('../db-handler')

before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())

describe("Repositories", function() {

    describe('/POST v1/repos', function () {
        it('should create a repo', function (done) {
            var jwt = config.get('testJwt');

            const body = `
                            {
                                "name": "abc",
                                "data_upload_id": "0000000009c5d71ee7600000"
                            }            
            `

            chai.request(server)
            .post('/api/v1/repositories')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                expect(err).is.null
                res.should.have.status(201);
                expect(res.body).to.be.an('object')
                expect(res.body).has.property('id')
                done();
            })
        })
    })

    describe('/POST v1/repobranches', function () {
        it('should create a repobranch', async function () {
            var jwt = config.get('testJwt');

            const body = `
                            {
                                "repo_id": "0000000009c5d71ee7600000",
                                "type": "standard",
                                "description": "desc",
                                "name": "branchname"
                            }            
            `
            const res = await chai.request(server)
            .post('/api/v1/repobranches')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))

            res.should.have.status(201);
            expect(res.body).to.be.an('object')
            expect(res.body).has.property('id')
        })
    })
})