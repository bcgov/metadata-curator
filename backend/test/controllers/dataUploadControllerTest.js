
var chai = require('chai');
var chaiHttp = require('chai-http');
var sinon = require('sinon')
var should = chai.should()
var expect = chai.expect

var {  commentService, dataUploadService } = require('../../services')

chai.use(chaiHttp);

describe("DataUploadController", function() {
    let sandbox
    before(async () => {
        sandbox = sinon.createSandbox();
        sandbox.stub(dataUploadService, 'createDataUpload').returns({name:"dupload"})
        sandbox.stub(dataUploadService, 'updateDataUpload').returns({name:"dupload"})
        sandbox.stub(dataUploadService, 'getDataUploadById').returns({name:"dupload"})
        sandbox.stub(dataUploadService, 'listDataUploads').returns([{name:"dupload"}])
        sandbox.stub(commentService, 'getComments').returns([{comment:"what_message"}])
        sandbox.stub(commentService, 'addComment').returns(null)
    })

    after(async () => {
        sandbox.restore()
    })

    const resStub = () => { stub = {
        status: function(s) {
            return {json : function(j) {
                stub.answer = "" + s + " " + JSON.stringify(j)
            }}
        },
        json: function(j) {
            stub.answer = "" + '200' + " " + JSON.stringify(j)
        }
    }; return stub;}

    it('should succeed post', async () => {
        let { dataUploadController } = require('../../controllers')
        const response = resStub()
        await dataUploadController.postDataUpload({body:{name:"abc", uploader:"aa"}}, response)
        expect(response.answer).to.equal( "201 {\"name\":\"dupload\"}");
    })

    it('should succeed put', async () => {
        let { dataUploadController } = require('../../controllers')
        const response = resStub()
        await dataUploadController.putDataUpload({params: {dataUploadId:'0000000009c5d71ee7600000'}, body:{name:"abc", uploader:"aa"}}, response)
        expect(response.answer).to.equal("200 {\"name\":\"dupload\"}")
    })

    it('should succeed listing data uploads', async () => {
        let { dataUploadController } = require('../../controllers')
        const response = resStub()
        await dataUploadController.getDataUploads({params: {}}, response)
        expect(response.answer).to.equal("200 [{\"name\":\"dupload\"}]")
    })

    it('should succeed get specific data upload', async () => {
        let { dataUploadController } = require('../../controllers')
        const response = resStub()
        await dataUploadController.getDataUpload({params: {dataUploadId:'0000000009c5d71ee7600000'}}, response)
        expect(response.answer).to.equal("200 {\"name\":\"dupload\"}")
    })

    it('should succeed get comments', async () => {
        let { dataUploadController } = require('../../controllers')
        const response = resStub()
        await dataUploadController.getDataUploadComments({params: {dataUploadId:'0000000009c5d71ee7600000'}}, response)
        expect(response.answer).to.equal("200 [{\"comment\":\"what_message\"}]")
    })

    it('should succeed put comments', async () => {
        let { dataUploadController } = require('../../controllers')
        const response = resStub()
        await dataUploadController.postDataUploadComment({params: {dataUploadId:'0000000009c5d71ee7600000'}, body:{name:"abc", comment:"aa"}}, response)
        expect(response.answer).to.equal("201 {\"message\":\"Comment saved successfully.\"}")
    })

})
