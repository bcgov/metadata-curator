var chai = require('chai');
var config = require('config');
var chaiHttp = require('chai-http');
var server = require('../../app');
var should = chai.should();
var expect = chai.expect;

chai.use(chaiHttp);

const dbHandler = require('../db-handler')

before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())

describe("Metadata Revisions", function() {

    describe('/POST v1/metadataRevisions', function () {
        it('should create a revision', function (done) {
            var jwt = config.get('testJwt');

            const body = `
                            {
                                "updater": "joe",
                                "change_summary": "some change",
                                "revision_number": "1",
                                "type": "tabular_data_package",
                                "repo_branch_id": "0000000009c5d71ee7600000"
                            }            
            `
            chai.request(server)
            .post('/api/v1/metadatarevisions')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                res.should.have.status(201);
                done();
            })
        })
        

    })

    describe('/GET v1/metadataRevisions/:id', function () {
        it('should get a revision', function (done) {
            var jwt = config.get('testJwt');

            chai.request(server)
            .get('/api/v1/metadatarevisions/' + '0000000009c5d71ee7600000')
            .set('Authorization' , 'Bearer ' + jwt)
            .send()
            .end(async function (err, res) {
                res.should.have.status(200);
                done();
            })
        })
        

    })

})