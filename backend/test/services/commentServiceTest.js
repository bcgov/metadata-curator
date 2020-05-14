var chai = require('chai')
chai.use(require('chai-as-promised'))
var sinon = require('sinon')
var should = chai.should()
var expect = chai.expect

const forumClient = require('../../clients/forumClient');

const dbHandler = require('../db-handler')
const commentService = require('../../services/commentService')
const dataUploadService = require('../../services/dataUploadService')

before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())

describe("CommentService", function() {
    let id

    before(async () => {
        sinon.stub(forumClient, 'addTopic').returns({_id:"0000000009c5d71ee7600000"})
        sinon.stub(forumClient, 'addComment').returns({_id:"0000011119c5d71ee7600000"})
    })

    beforeEach(async () => {

        const newData = await dataUploadService.createDataUpload({name:"abc",uploader:"joe", opened_by_approver: false})

        id = newData._id

        const comment = await commentService.addComment(id, {}, 'mycomment')
        expect(comment).to.be.an('undefined')
    })

    it('should succeed adding a comment', async () => {
        const data = await dataUploadService.getDataUploadById(id)
        expect(data).to.be.an('object')
        expect(data.name).to.equal("abc")
        expect(data.topic_id.toString()).to.equal("0000000009c5d71ee7600000")
        expect(data.approver_has_commented).to.equal(false)
        expect(data.opened_by_approver).to.equal(false)
    })

    it('should succeed getting comments', async () => {
        sinon.stub(forumClient, 'getComments').returns([{_id:"0000011119c5d71ee7600000", comment: "mycomment"}])

        const list = await commentService.getComments(id)
        expect(list).to.be.an('array')
        expect(list).to.have.lengthOf(1)
        expect(list[0].comment).to.equal("mycomment")
    })
})
