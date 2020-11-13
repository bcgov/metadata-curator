var chai = require('chai')
chai.use(require('chai-as-promised'))
var sinon = require('sinon')
var should = chai.should()
var expect = chai.expect

const forumClient = require('../../clients/forum_client');
const repoService = require('../../services/repoService')
const dataUploadService = require('../../services/dataUploadService')

const dbHandler = require('../db-handler')
before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())

describe("RepoServiceTest", function() {

    let duid, rid;
    before(async () => sinon.stub(forumClient, 'addTopic').returns({_id:"0000000009c5d71ee7600000"}))
    beforeEach (async () => {
        duid = await dataUploadService.createDataUpload({},{name:"my_upload",uploader:"joe"})
        rid = await repoService.createRepo('some repo name');
    })
    after(async () => {
        sinon.restore();
    })

    it('should succeed creating a new repository', async () => {
        const result = await repoService.createRepo('another repo');
        expect(result).to.be.an('object')
        expect(result.name).to.equal('another repo')
    })
    it('should succeed with expected number of repositories', async () => {
        const result = await repoService.listRepositoriesByDataUpload(duid);
        expect(result).has.length(1);
    })
    it('should succeed retrieving the repository', async () => {
        const result = await repoService.getRepoById(rid);
        expect(result).to.be.an('object')
        expect(result.name).to.equal('some repo name')
    })

    it('should succeed create a repo with a data package', async () => {
        const descriptor = {
            profile: "tabular-data-package",
            resources: [
                {
                    name: "my_resource",
                    path: "test.csv",
                    schema: { fields: [ {name: "field1", type: "string"}]},
                    profile: "tabular-data-resource"
                }
            ]
        }
        const result = await repoService.createRepoWithDataPackage('some repo', 'joe@local', descriptor);
        expect(result).to.be.an('object')
        expect(result.change_summary).to.equal('Initial metadata')
    })
})
