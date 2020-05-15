var chai = require('chai')
chai.use(require('chai-as-promised'))
var should = chai.should()
var expect = chai.expect

const dataUploadService = require('../../services/dataUploadService')

const dbHandler = require('../db-handler')
before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())

describe("DataUploadService", function() {
    
    it('should fail because of missing fields', async () => {
        await expect(dataUploadService.createDataUpload({})).to.be.rejectedWith(Error)
    })

    it('should succeed add new new data upload', async () => {
        const data = {
            name: "abc",
            uploader: "joe"
        }
        const newData = await dataUploadService.createDataUpload(data)
        await expect(newData.name).equal('abc')
    })

    it('should list the same record', async () => {
        await dataUploadService.createDataUpload({name:"abc",uploader:"joe"})

        const data = await dataUploadService.listDataUploads()
        expect(data).to.have.lengthOf(1)
        expect(data[0].uploader).to.equal("joe")
        //expect(data).to.be.an('array').that.is.empty
    })

    it('should update successfully', async () => {
        const data = await dataUploadService.createDataUpload({name:"abc",uploader:"joe"})

        const id = data._id

        const newData = await dataUploadService.updateDataUpload(id, {name:"abcd",uploader:"joe", opened_by_approver: false, approver_has_commented:false})
        await expect(newData.name).equal('abcd')
    })

    it('should get no records in database', async () => {
        const data = await dataUploadService.listDataUploads()
        expect(data).to.be.an('array').that.is.empty
    })


    it('should get the same record', async () => {
        const newData = await dataUploadService.createDataUpload({name:"abc",uploader:"joe"})

        const id = newData._id

        const data = await dataUploadService.getDataUploadById(id)
        expect(data).to.be.an('object')
        expect(data.name).to.equal("abc")
    })

    it('should fail because of invalid id', async () => {
        const data = await dataUploadService.getDataUploadById('000006a5d9c5d71ee7600000')
        await expect(data).to.be.null
    })

})
