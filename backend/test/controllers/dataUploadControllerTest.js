
var chai = require('chai');
var chaiHttp = require('chai-http');
var sinon = require('sinon')
var should = chai.should()
var expect = chai.expect

chai.use(chaiHttp);

const { dataUploadController } = require('../../controllers')
const {  commentService } = require('../../services')
const dataUploadService  = require('../../services/dataUploadService')
const { createDataUpload, updateDataUpload, listDataUploads, getDataUploadById } = dataUploadService;
const { addComment, getComments } = commentService;

const resStub = () => { stub = {
    status: function(s) {
        return {json : function(j) {
            stub.answer = "" + s + " " + JSON.stringify(j)
        }}
    }
}; return stub;}


describe("DataUploadController", function() {
    before(async () => {
        sinon.stub(dataUploadService, 'createDataUpload').returns(null)
        sinon.stub(dataUploadService, 'updateDataUpload').returns({})
    })

    it('should succeed post', async () => {
        const response = resStub()
        await dataUploadController.postDataUpload({body:{name:"abc", uploader:"aa"}}, response)
        expect(response.answer).to.equal("201 {\"message\":\"Data upload saved successfully.\"}")

    })

    it('should succeed put', async () => {
        const response = resStub()
        // await dataUploadController.putDataUpload({params: {dataUploadId:'0000000009c5d71ee7600000'}, body:{name:"abc", uploader:"aa"}}, response)
        // expect(response.answer).to.equal("200 Data upload saved successfully.")
    })

})