
var chai = require('chai');
var chaiHttp = require('chai-http');
var sinon = require('sinon')
var should = chai.should()
var expect = chai.expect

var { repoBranchService, revisionService } = require('../../services')

chai.use(chaiHttp);

describe("RepositoryController", function() {
    let sandbox
    before(async () => {
        sandbox = sinon.createSandbox();
        sandbox.stub(repoBranchService, 'getBranchById').returns({_id:"00", name:"branch1"})
        sandbox.stub(repoBranchService, 'deleteBranch').returns()
        sandbox.stub(repoBranchService, 'updateBranch').returns({_id:"00", name:"branch_updated"})
        sandbox.stub(revisionService, 'createRevisionWithDataPackage').returns({_id:"00", change_summary:"chg"})
        sandbox.stub(revisionService, 'getRevisionById').returns({_id:"00", repo_branch_id:"b0", change_summary:"chg"})
        sandbox.stub(revisionService, 'updateRevision').returns({_id:"00", repo_branch_id:"b0", change_summary:"upd"})
        sandbox.stub(revisionService, 'deleteRevision').returns()
        sandbox.stub(revisionService, 'listRevisionsByBranch').returns([{_id:"00", change_summary:"chg"}])
    })

    after(async () => {
        sandbox.restore()
    })

    const resStub = () => { stub = {
        status: function(s) {
            return {json : function(j) {
                stub.answer = "" + s + " " + JSON.stringify(j)
            },send : function(j) {
                stub.answer = "" + s + " no-content"
            }}
        },
        json: function(j) {
            stub.answer = "" + '200' + " " + JSON.stringify(j)
        }
    }; return stub;}


    it('should succeed getting a branch', async () => {
        let { repoBranchController } = require('../../controllers')
        const response = resStub()
        await repoBranchController.getBranch({params:{repoId:'00',branchId:'00'}}, response)
        expect(response.answer).to.equal( "200 {\"_id\":\"00\",\"name\":\"branch1\"}");
    })

    it('should succeed deleting a branch from a repository', async () => {
        let { repoBranchController } = require('../../controllers')
        const response = resStub()
        await repoBranchController.deleteBranch({params:{branchId:'00'}}, response)
        expect(response.answer).to.equal( "204 no-content");
    })

    it('should succeed updating a branch', async () => {
        let { repoBranchController } = require('../../controllers')
        const response = resStub()
        await repoBranchController.putBranch({params:{branchId:'00'}, body:{name:'new_branch'}}, response)
        expect(response.answer).to.equal( "200 {\"_id\":\"00\",\"name\":\"branch_updated\"}");
    })

    it('should succeed creating a new revision for a branch', async () => {
        let { repoBranchController } = require('../../controllers')
        const response = resStub()
        await repoBranchController.postRevision({params:{branchId:'00'}, body:{change_summary:'new_revision'}}, response)
        expect(response.answer).to.equal( "201 {\"id\":\"00\"}");
    })

    it('should succeed getting revision details', async () => {
        let { repoBranchController } = require('../../controllers')
        const response = resStub()
        await repoBranchController.getRevision({params:{branchId:'b0',revId:'01'}}, response)
        expect(response.answer).to.equal( "200 {\"_id\":\"00\",\"repo_branch_id\":\"b0\",\"change_summary\":\"chg\"}");
    })

    it('should succeed updating revision details', async () => {
        let { repoBranchController } = require('../../controllers')
        const response = resStub()
        await repoBranchController.putRevision({params:{branchId:'b0',revId:'01'}, body:{change_summary:'upd_revision'}}, response)
        expect(response.answer).to.equal( "200 {\"_id\":\"00\",\"repo_branch_id\":\"b0\",\"change_summary\":\"upd\"}");
    })

    it('should succeed deleting a revision', async () => {
        let { repoBranchController } = require('../../controllers')
        const response = resStub()
        await repoBranchController.deleteRevision({params:{branchId:'00',revId:'01'}}, response)
        expect(response.answer).to.equal( "204 no-content");
    })

    it('should succeed getting list of revisions for branch', async () => {
        let { repoBranchController } = require('../../controllers')
        const response = resStub()
        await repoBranchController.getRevisions({params:{branchId:'00'}}, response)
        expect(response.answer).to.equal( "200 [{\"_id\":\"00\",\"change_summary\":\"chg\"}]");
    })

})
