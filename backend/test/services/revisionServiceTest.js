var chai = require('chai')
chai.use(require('chai-as-promised'))
var should = chai.should()
var expect = chai.expect
var sinon = require('sinon')

const forumClient = require('../../clients/forum_client');
const repoService = require('../../services/repoService')
const repoBranchService = require('../../services/repoBranchService')
const dataUploadService = require('../../services/dataUploadService')
const revisionService = require('../../services/revisionService')

const dbHandler = require('../db-handler')
before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())

describe("RevisionService Test", function() {
    let duid, rid, bid, revid, pkgDesc;

    before(async() => sinon.stub(forumClient, 'addTopic').returns({_id:"0000000009c5d71ee7600000"}))
    beforeEach (async () => {
        duid = await dataUploadService.createDataUpload({},{name:"my_upload",uploader:"joe"})
        rid = await repoService.createRepo(duid._id, 'some repo name');
        bid = await repoBranchService.addBranch(rid._id, 'standard', 'Standard dataset', "Description about the standard metadata");

        pkgDesc = {
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
        revid = await revisionService.createRevisionWithDataPackage(bid, 'Change summary', 'joe@local', pkgDesc);
    })
    after(async () => {
        sinon.restore();
    })

    it('should succeed creating a revision', async () => {
        let descriptor = {
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
        const result = await revisionService.createRevisionWithDataPackage(bid, 'Change summary', 'joe@local', descriptor);

        expect(result).to.be.an('object')
        expect(result.change_summary).to.equal('Change summary')
    })
    
    it('should succeed listing revisions', async () => {
        const result = await revisionService.listRevisionsByBranch(bid._id);
        expect(result).to.be.an('array') 
        expect(result).has.length(1)
    })

    it('should succeed getting revision', async () => {
        const result = await revisionService.getRevisionById(revid._id);
        expect(result).to.be.an('object') 
        expect(result.change_summary).to.equal('Change summary')
    })    

    it('should succeed deleting a revision', async () => {
        const result = await revisionService.deleteRevision(revid._id);
        expect(result).to.be.an('undefined')
    })    

    it('should fail deleting a revision because it is the first one', async () => {
        newrev = await revisionService.createRevisionWithDataPackage(bid, 'New changes', 'joe@local', pkgDesc);
        await expect(revisionService.deleteRevision(revid._id)).to.be.rejectedWith('Only the most recent revision can be deleted.')
    })    
})
