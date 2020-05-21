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

describe("Table Schemas", function() {

    describe('/POST v1/tableschemas', function () {
        it('should create a table schema', async function () {
            var jwt = config.get('testJwt');

            const body = `
                            {
                                "fields" : [
                                    {
                                    "name" : "height",
                                    "type" : "integer"
                                    },
                                    {
                                    "name" : "age",
                                    "type" : "integer"
                                    },
                                    {
                                    "name" : "name",
                                    "type" : "string"
                                    }
                                ]
                            }            
            `
            chai.request(server)
            .post('/api/v1/tableschemas')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                res.should.have.status(201);
            })
        })

        it('should fail with bad field type', async function () {
            var jwt = config.get('testJwt');

            const body = `
                            {
                                "fields" : [
                                    {
                                    "name" : "height",
                                    "type" : "ppinteger"
                                    },
                                    {
                                    "name" : "age",
                                    "type" : "integer"
                                    },
                                    {
                                    "name" : "name",
                                    "type" : "string"
                                    }
                                ]
                            }            
            `
            chai.request(server)
            .post('/api/v1/tableschemas')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                res.should.have.status(400);
                expect(res.body.error.message).to.equal('Unable to save schema.  Failed validation.')
            })
        })        
    })

})