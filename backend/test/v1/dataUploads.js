var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../app');
var should = chai.should();
var expect = chai.expect;
/*

let seedConfig = require('../../md-seed-config');
let {MdSeedRunner} = require('mongoose-data-seed');
let defaultData = seedConfig.seedersData.DataUploadData;

var config = require('config');
var jwt = config.get('testDp1User1Jwt');
var db = require('../../routes/db/db');
var logger = require('npmlog');

chai.use(chaiHttp);

describe("Data Uploads", function() {


    describe('/GET v1/dataUploads', function () {
        before(function(done){
            const seeder = new MdSeedRunner(seedConfig);
            seeder.run({dropDatabase: true}).subscribe({
                next: ({ name, results }) => {},
                error: ({ name, error }) => {},
                complete: () => {done()}
            });
        });

        after(function(done){
            done();
        });

        it('should not allow unauthorized access');

        it('should get uploads', function (done) {
            chai.request(server)
                .get('/api/v1/datauploads')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.should.have.lengthOf(defaultData.length);
                    done();
                });
        });

        it('should retrieve a specific upload', function (done) {
            const upload = defaultData[0];
            chai.request(server)
                .get(`/api/v1/datauploads/${upload._id}`)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    dataUploadCompare(upload, res.body);
                    done();
                });
        });

        it('should indicate requested upload does not exist', function (done) {
            const nonExistentUploadId = "3e7a11e110abf1bbf5011f11";
            let upload = defaultData[0];
            upload._id = nonExistentUploadId;
            chai.request(server)
                .get(`/api/v1/datauploads/${upload._id}`)
                .end(function (err, res) {
                    res.should.have.status(404);
                    done();
                });
        });

    });

    describe('/POST v1/datauploads', function () {

        let body = {};

        before(function(done){
            body = {
                name: "Dataset xyz - Upload sjdfk",
                description: "Upload for dataset xyz",
                uploader: "jane doe",
                files: [
                    {
                        "name": "filename1.csv",
                        "size": 1000
                    },
                    {
                        "name": "filename2.csv",
                        "size": 2000
                    }
                ]
            };
            seedConfig.dropdb();
            done();
        });

        after(function(done){
            done();
        });

        it('should not allow unauthorized access');

        it('should create an upload', function (done) {
            chai.request(server)
                .post('/api/v1/datauploads')
                .send(body)
                .end(async function (err, res) {
                    res.should.have.status(201);
                    const dataUploads = await db.DataUploadSchema.find({});
                    dataUploads.should.have.lengthOf(1);
                    const dataUpload = dataUploads[0];
                    dataUploadCompare(body, dataUpload);
                    done();
                });

        });

        it('should reject an upload with missing required properties', function (done) {
            const uploadBody = { ...body, name: null};
            chai.request(server)
                .post('/api/v1/datauploads')
                .send(uploadBody)
                .end(async function (err, res) {
                    res.should.have.status(500);
                    done();
                });

        });

    });

    describe('/PUT v1/datauploads', function() {

        let existingUploadBody = {};

        before(function(done){
            const seeder = new MdSeedRunner(seedConfig);
            seeder.run({dropDatabase: true}).subscribe({
                next: ({ name, results }) => {},
                error: ({ name, error }) => {},
                complete: () => {done()}
            });
            existingUploadBody = seedConfig.seedersData.DataUploadData[0];
        });

        after(function(done){
            done();
        });

        it('should not allow unauthorized access');

        it('should update an existing data upload', function (done) {
            const body = { ...existingUploadBody,
                            name: "new name",
                            description: "new desc"
                            };
            chai.request(server)
                .put(`/api/v1/datauploads/${body._id}`)
                .send(body)
                .end(async function (err, res) {
                    res.should.have.status(200);
                    const dataUploads = await db.DataUploadSchema.find({_id: body._id});
                    dataUploads.should.have.lengthOf(1);
                    const dataUpload = dataUploads[0];
                    dataUploadCompare(body, dataUpload);
                    done();
                });

        });

    });


});

function dataUploadCompare(sourceUpload, upload) {
    upload.should.have.property("name").eql(sourceUpload.name);
    upload.should.have.property("description").eql(sourceUpload.description);
    upload.should.have.property("uploader").eql(sourceUpload.uploader);
    upload.files.should.have.lengthOf(sourceUpload.files.length);

    sourceUpload.files.forEach(file => {
        const matchingFile = upload.files.find(item => item.name === file.name);
        should.exist(matchingFile);
        matchingFile.should.have.property("name").eql(file.name);
        matchingFile.should.have.property("size").eql(file.size);
    });
}
*/