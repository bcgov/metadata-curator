var mongoose = require('mongoose')
var sinon = require('sinon')
var chai = require('chai')
chai.use(require('chai-as-promised'))
var should = chai.should()
var expect = chai.expect

const ValidationError = require('../../modules/validationError');

const {Schema} = require('tableschema');
const {DataPackageError} = require('datapackage');

const {  dataPackageService } = require('../../services')

const tableSchemaService = require('../../services/tableSchemaService')

const dbHandler = require('../db-handler')
before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())

const handle = function(e) {
    console.log("Oh no! " + e);
}
describe("DataPackageService", function() {
    let sandbox
    before(async () => {
        sandbox = sinon.createSandbox();
        //sandbox.stub(tableSchemaService, 'formatValidation').returns([])
    })

    after(async () => {
        sandbox.restore()
    })

    it('should fail with frictionlessdata validation - missing resources', async () => {
        const desc = {
        }
        //const err = 'Validation errors [{"message":"Descriptor validation error: Missing required property: resources at  in descriptor and at /required/0 in profile","validationErrorBySections":{"desc":"Descriptor validation error:","field":"Missing required property: resources","validationRule":"at  in descriptor and"}}] -- []'
        await expect(dataPackageService.addDataPackage(desc)).to.be.rejectedWith('validation errors')
    })

    it('should fail with Mongoose validation errors', async () => {
        const desc = {
            profile: "tabular-data-package",
            resources: [
                {
                    name: "my_resource",
                    path: "test.csv",
                    schema: { fields: [ {name: "field1"}]},
                    profile: "tabular-data-resource"
                }
            ]
        }
        await expect(dataPackageService.addDataPackage(desc)).to.be.rejectedWith('DB Validation Error')
    })

    it('should fail with Frictionlessdata validation errors', async () => {
        const desc = {
            profile: "tabular-data-package",
            resources: [
                {
                    name: "my_resource",
                    path: "test.csv",
                    schema: { fields: [ {name: "field1", type:"bad_type"}]},
                    profile: "tabular-data-resource"
                }
            ]
        }
        const result = dataPackageService.addDataPackage(desc)
        const err = 'Validation Error - {"resources.0.tableSchema.fields.0.type":{"message":"Path `type` is required.","name":"ValidatorError","properties":{"message":"Path `type` is required.","type":"required","path":"type"},"kind":"required","path":"type"},"resources.0.tableSchema":{"errors":{"fields.0.type":{"message":"Path `type` is required.","name":"ValidatorError","properties":{"message":"Path `type` is required.","type":"required","path":"type"},"kind":"required","path":"type"}},"_message":"Validation failed","message":"Validation failed: fields.0.type: Path `type` is required.","name":"ValidationError"}}'
        let resmap = new Map();
        await expect(result).to.be.rejectedWith(new ValidationError("validation errors", resmap))
//        await expect(result.errors).length(2)
    })

    it('should succeed with valid resources', async () => {
        const desc = {
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
        const result = await dataPackageService.addDataPackage(desc)
        expect(result.id).to.exist

        expect (await dataPackageService.getDataPackageById(result.id)).to.be.an('object')
    })

    it('should succeed list data packages', async () => {
        const result = await dataPackageService.listDataPackages()
        expect(result).to.be.an('array')
    })

    it('should succeed updating a data package', async () => {
        const desc = {
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

        const result = await dataPackageService.addDataPackage(desc)
        expect(result.id).to.exist

        desc.resources[0].schema.fields.push({name: "field2", type: "string"})

        const update = await dataPackageService.updateDataPackage(result.id, desc)
        expect (update).to.be.an('object')
        expect (update.resources).has.length(1)
        expect (update.resources[0].schema.fields).has.length(2)
        expect (update.resources[0].schema.fields[1].name).is.equal("field2")

        const updated = await dataPackageService.getDataPackageById(result.id)
        expect (updated).to.be.an('object')
        expect (updated.resources).has.length(1)
        expect (updated.resources[0].schema.fields).has.length(2)
        expect (updated.resources[0].schema.fields[1].name).is.equal("field2")
    })

    it('should succeed with valid table schema', async () => {
        const desc = { fields: [ {name: "field1", type: "string"}]}

        const result = await dataPackageService.addDataPackageFromTableSchema(desc)
        expect(result.id).to.exist

        expect (await dataPackageService.getDataPackageById(result.id)).to.be.an('object')
    })    
})
