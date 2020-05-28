
var chai = require('chai');
var chaiHttp = require('chai-http');
var sinon = require('sinon')
var should = chai.should()
var expect = chai.expect

var { repoBranchService, repoService } = require('../../services')

chai.use(chaiHttp);

describe("RepositoryController", function() {
    let sandbox
    before(async () => {
        sandbox = sinon.createSandbox();
        sandbox.stub(repoBranchService, 'addBranch').returns({_id:"00", name:"dupload"})
        sandbox.stub(repoService, 'listRepositories').returns([{_id:"01", name:"repo1"}])
        sandbox.stub(repoBranchService, 'listBranches').returns([{_id:"00", name:"branch1"}])
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

    it('should succeed creating a new branch of a repository', async () => {
        let { repositoryController } = require('../../controllers')
        const response = resStub()
        await repositoryController.postBranch({params:{repoId:'00'}, body:{name:"abc"}}, response)
        expect(response.answer).to.equal( "201 {\"id\":\"00\"}");
    })

    it('should succeed getting a list of branches of a repository', async () => {
        let { repositoryController } = require('../../controllers')
        const response = resStub()
        await repositoryController.getBranches({params:{repoId:'00'}}, response)
        expect(response.answer).to.equal( "200 [{\"_id\":\"00\",\"name\":\"branch1\"}]");
    })

    it('should succeed getting a list of all repositories', async () => {
        let { repositoryController } = require('../../controllers')
        const response = resStub()
        await repositoryController.getRepos({}, response)
        expect(response.answer).to.equal( "200 [{\"_id\":\"01\",\"name\":\"repo1\"}]");
    })

})
