var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var logger = require('npmlog');
var rewire = require('rewire');
var sinon = require('sinon');
var datapackageInferModule = rewire('../../modules/semantic-infer/datapackage_infer');
const constants = require('../../modules/semantic-infer/constants');
const semanticinfer = require('../../modules/semantic-infer/semantic_infer');


describe('Datapackage Infer', function() {

    let infer_datapackage, semantically_classify_field_stub;
	const VAR_CLASS_ATTR = constants.VAR_CLASS_ATTR;
	const RDF_ATTR = constants.RDF_ATTR;
	const SAVED_PATH_ATTR = constants.SAVED_PATH_ATTR;
	
    describe('infer_datapackage', function () {
		this.timeout(10000); 
		const descriptor1 = {
			"resources": [
			  {"path": "banana.doc", "name": "banana", "title":"The banana split diaries", "description": "some info", "start_date":"2011-12-01", "end_date":"2017-12-01"},
			  {
				  "name": "example",
				  "saved_path": "example.csv",
				  "data": [
					["height", "age", "name"],
					["180", "18", "val1"],
					["192", "32", "val2"],
				  ]
				}
			  ]
			}
		const descriptor2 = {
  "resources": [
    {
      "path": "banana.doc",
      "name": "banana",
      "title": "The banana split diaries",
      "description": "some info",
      "start_date": "2011-12-01",
      "end_date": "2017-12-01",
      "profile": "data-resource",
      "encoding": "utf-8"
    },
    {
      "name": "example",
      "profile": "tabular-data-resource",
      "encoding": "utf-8",
      "schema": {"fields": [
  { "name": "height", "type": "integer", "format": "default" },
  { "name": "age", "type": "integer", "format": "default" },
  {
    "name": "name",
    "type": "string",
    "format": "default"
  }
	  ],
  missingValues: [ "" ]},
      "path": "example.csv"
    }
  ],
  "profile": "data-package"
}
const descriptor3 = {
  "resources": [
    {
      "path": "banana.doc",
      "name": "banana",
      "title": "The banana split diaries",
      "description": "some info",
      "start_date": "2011-12-01",
      "end_date": "2017-12-01",
      "profile": "data-resource",
      "encoding": "utf-8"
    },
    {
      "name": "example",
      "profile": "tabular-data-resource",
      "encoding": "utf-8",
      "schema": {"fields": [
  { "name": "height", "type": "integer", "format": "default" },
  { "name": "age", "type": "integer", "format": "default" },
  {
    "name": "name",
    "type": "string",
    "format": "default",
	"rdfType":"https://schema.org/postalCode",
	"var_class":"indirect_identifier"
  }
	  ],
  missingValues: [ "" ]},
      "path": "example.csv"
    }
  ],
  "profile": "data-package"
}
        before(function(){
            infer_datapackage = datapackageInferModule.__get__('infer_datapackage');
            infer_datapackage = sinon.spy(infer_datapackage);
            datapackageInferModule.__set__('infer_datapackage', infer_datapackage);
			semantically_classify_field_stub = sinon.stub(semanticinfer, 'semantically_classify_field');
        });

        it.only('should return the a data package without semantic fields when no semantic matches are found', async function() {
			semantically_classify_field_stub.returns('none');
			const result = await infer_datapackage(descriptor1);
            //console.log(result.resources[1].schema.fields);
			result.should.eql(descriptor2);
        });

		it.only('should return the a data package with semantic fields when a semantic match is found', async function() {
			semantically_classify_field_stub.withArgs('name', ['val1','val2'], 'string').returns({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
			semantically_classify_field_stub.returns('none');
			const result = await infer_datapackage(descriptor1);
			//console.log(result.resources[1].schema.fields);
			result.should.eql(descriptor3);
        });
    });
});
