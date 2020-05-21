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

describe("Data Packages", function() {

    describe('/POST v1/dataPackages', function () {
        it('should create a schema', function (done) {
            var jwt = config.get('testJwt');

            const body = `
                            {
                                "profile": "tabular-data-package",
                                "name": "my-dataset",
                                "resources" : [
                                {
                                    "name" : "resource_1",
                                    "profile" : "tabular-data-resource",
                                    "data": [],
                                    "schema" : {
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
                                },
                                {
                                    "name" : "resource_2",
                                    "profile" : "tabular-data-resource",
                                    "data": [],
                                    "schema" : {
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
                                        },
                                        {
                                        "name" : "fname",
                                        "type" : "string"
                                        }
                                    ]
                                    }
                                }
                                ]
                            }            
            `
            chai.request(server)
            .post('/api/v1/datapackageschemas')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                res.should.have.status(201);
                done();
            })
        })
        it('should fail to create a schema - bad name', function (done) {
            var jwt = config.get('testJwt');

            const body = `
                            {
                                "profile": "tabular-data-package",
                                "name": "$#&*$(#",
                                "resources" : [
                                {
                                    "name" : "resource_1",
                                    "profile" : "tabular-data-resource",
                                    "data": [],
                                    "schema" : {
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
                                },
                                {
                                    "name" : "resource_2",
                                    "profile" : "tabular-data-resource",
                                    "data": [],
                                    "schema" : {
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
                                        },
                                        {
                                        "name" : "fname",
                                        "type" : "string"
                                        }
                                    ]
                                    }
                                }
                                ]
                            }            
            `
            chai.request(server)
            .post('/api/v1/datapackageschemas')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                res.should.have.status(400);
                done();
            })
        })

        it('should fail to create a schema - invalid field type', function (done) {
            var jwt = config.get('testJwt');

            const body = `
                            {
                                "profile": "tabular-data-package",
                                "name": "dataset",
                                "resources" : [
                                {
                                    "name" : "resource_1",
                                    "profile" : "tabular-data-resource",
                                    "data": [],
                                    "schema" : {
                                    "fields" : [
                                        {
                                        "name" : "height",
                                        "type" : "bad_integer"
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
                                }
                                ]
                            }            
            `
            chai.request(server)
            .post('/api/v1/datapackageschemas')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                res.should.have.status(400);
                done();
            })
        })

        it('should fail to create a schema - resources missing', function (done) {
            var jwt = config.get('testJwt');

            const body = `
                            {
                                "profile": "tabular-data-package",
                                "name": "dataset"
                            }            
            `
            chai.request(server)
            .post('/api/v1/datapackageschemas')
            .set('Authorization' , 'Bearer ' + jwt)
            .send(JSON.parse(body))
            .end(async function (err, res) {
                res.should.have.status(400);
                done();
            })
        })

    })
})