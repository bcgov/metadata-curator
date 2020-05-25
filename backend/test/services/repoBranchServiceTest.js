var chai = require('chai')
chai.use(require('chai-as-promised'))
var should = chai.should()
var expect = chai.expect

const repoService = require('../../services/repoService')
const repoBranchService = require('../../services/repoBranchService')
const revisionService = require('../../services/revisionService')
const dataUploadService = require('../../services/dataUploadService')

const dbHandler = require('../db-handler')
before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())

describe("RepoBranchServiceTest", function() {
    let duid, rid, bid;
    beforeEach (async () => {
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

        duid = await dataUploadService.createDataUpload({name:"my_upload",uploader:"joe"})
        rid = await repoService.createRepo(duid, 'some repo name');
        bid = await repoBranchService.addBranch(rid._id, 'standard', 'Standard dataset', "Description about the standard metadata");
//        revid = await revisionService.createRevisionWithDataPackage(bid, 'Change summary', 'joe@local', descriptor);
    })

    it('should succeed creating a new repository branch', async () => {
        const result = await repoBranchService.addBranch(rid, 'standard', 'Standard dataset', "Description about the standard metadata");
        expect(result).to.be.an('object') 
        expect(result.name).to.equal('Standard dataset')
        expect(result.revisions).has.length(0)
    })

    it('should succeed listing branches', async () => {
        const result = await repoBranchService.listBranches(rid);
        expect(result).to.be.an('array') 
        expect(result).has.length(1)
    })

    it('should succeed getting branch', async () => {
        const result = await repoBranchService.getBranchById(bid);
        expect(result).to.be.an('object') 
        expect(result.name).to.equal('Standard dataset')
    })

    // it('should succeed adding a new revision', async () => {
    //     const result = await repoBranchService.addRevision(bid, revid);
    //     expect(result).to.be.an('object') 
    //     expect(result.name).to.equal('Standard dataset')
    //     expect(result.revisions).has.length(0)
    // })

    it('should fail creating with missing name', async () => {
        await expect(repoBranchService.addBranch(rid, 'standard', null, null)).to.be.rejectedWith('repoBranch validation failed: name: Path `name` is required., description: Path `description` is required.')
    })
})
