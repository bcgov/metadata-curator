var chai = require('chai')
chai.use(require('chai-as-promised'))
var sinon = require('sinon')
var should = chai.should()
var expect = chai.expect
var assert = chai.assert
var assertSame = chai.assertSame

var jsondiffpatch = require('jsondiffpatch');

const {Resource} = require('datapackage');

describe("Resource compare using jsondiffpatch", function() {
    it('should succeed as they are equal', async () => {
        const resource1 = {
            name: "my_resource",
            path: "test.csv",
            schema: { fields: [ {name: "field1", type: "string"}]},
            profile: "tabular-data-resource"
        }
        const resource2 = {
            name: "my_resource",
            path: "test.csv",
            schema: { fields: [ {name: "field1", type: "string"}]},
            profile: "tabular-data-resource"
        }

        const lhs = await Resource.load(resource1, {strict: false});
        const rhs = await Resource.load(resource2, {strict: false});

        var delta = jsondiffpatch.create({
            objectHash: function(obj, index) {
              // try to find an id property, otherwise just use the index in the array
              return obj.name || obj.id || obj._id || '$$index:' + index;
            }
          }).diff(lhs, rhs);
        
        assert(delta === undefined); // no diff
    })

    it('should have difference due to different field type', async () => {
        const resource1 = {
            name: "my_resource",
            path: "test.csv",
            schema: { fields: [ {name: "field1", type: "string"}]},
            profile: "tabular-data-resource"
        }
        const resource2 = {
            name: "my_resource",
            path: "test.csv",
            schema: { fields: [ {name: "field1", type: "number"}]},
            profile: "tabular-data-resource"
        }

        const lhs = await Resource.load(resource1, {strict: false})
        const rhs = await Resource.load(resource2, {strict: false})

        var delta = jsondiffpatch.create({
            objectHash: function(obj, index) {
              // try to find an id property, otherwise just use the index in the array
              return obj.name || obj.id || obj._id || '$$index:' + index;
            }
          }).diff(lhs.descriptor, rhs.descriptor)

        expect(delta).to.deep.equal({
            "schema": {
               "fields": {
                  "0": {
                     "type": [
                        "string",
                        "number"
                     ]
                  },
                  "_t": "a"
               }
            }
         })

    })

    it('should have diff due to field type and new field', async () => {
        const resource1 = {
            name: "my_resource",
            path: "test.csv",
            schema: { fields: [ {name: "field1", type: "string"}]},
            profile: "tabular-data-resource"
        }
        const resource2 = {
            name: "my_resource",
            path: "test.csv",
            schema: { fields: [ {name: "field2", type: "string"}, {name: "field1", type: "number"}]},
            profile: "tabular-data-resource"
        }

        const lhs = await Resource.load(resource1, {strict: false})
        const rhs = await Resource.load(resource2, {strict: false})

        var delta = jsondiffpatch.create({
            objectHash: function(obj, index) {
              // try to find an id property, otherwise just use the index in the array
              return obj.name || obj.id || obj._id || '$$index:' + index;
            }
          }).diff(lhs.descriptor, rhs.descriptor)

        expect(delta).to.deep.equal({
            "schema": {
               "fields": {
                  "0": [
                     {
                        "name": "field2",
                        "type": "string",
                        "format": "default"
                     }
                  ],
                  "1": {
                     "type": [
                        "string",
                        "number"
                     ]
                  },
                  "_t": "a"
               }
            }
         })

    })

    it('should have diff due to changed name', async () => {
        const resource1 = {
            name: "my_resource",
            path: "test.csv",
            schema: { fields: [ {name: "field1", type: "string"}]},
            profile: "tabular-data-resource"
        }
        const resource2 = {
            name: "my_resource_2",
            path: "test.csv",
            schema: { fields: [ {name: "field1", type: "string"}]},
            profile: "tabular-data-resource"
        }

        const lhs = await Resource.load(resource1, {strict: false})
        const rhs = await Resource.load(resource2, {strict: false})

        var delta = jsondiffpatch.create({
            objectHash: function(obj, index) {
              // try to find an id property, otherwise just use the index in the array
              return obj.name || obj.id || obj._id || '$$index:' + index;
            }
          }).diff(lhs.descriptor, rhs.descriptor)

        expect(delta).to.deep.equal({
            "name": [
               "my_resource",
               "my_resource_2"
            ]
         })

    })

})

