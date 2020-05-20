var chai = require('chai')
chai.use(require('chai-as-promised'))
var should = chai.should()
var expect = chai.expect

const {Schema} = require('tableschema');

const tableSchemaService = require('../../services/tableSchemaService')

const dbHandler = require('../db-handler')
before(async () => await dbHandler.connect())
afterEach(async () => await dbHandler.clearDatabase())
after(async () => await dbHandler.closeDatabase())



describe("TableSchemaService", function() {
    
    it('should succeed with no validation errors', async () => {

        const desc = {
            fields: [{name: "f1", type: "string"}]
        }
        const schema = await Schema.load(desc)
        await expect(schema.valid).to.be.true

        const result = await tableSchemaService.formatValidation(schema)
        await expect(result).to.be.an('array')
    })

    it('should fail with invalid type', async () => {

        const desc = {
            fields: [{name: "f1", type: "bogus_type"}]
        }
        const schema = await Schema.load(desc)
        await expect(schema.valid).to.be.false
        
        const result = await tableSchemaService.formatValidation(schema)
        await expect(result).to.be.an('array')
        await expect(result).length(1)
        await expect(result[0].validationErrorBySections.field).to.equal('Data does not match any schemas from anyOf')
    })

})
