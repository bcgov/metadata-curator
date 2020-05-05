var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var logger = require('npmlog');
var rewire = require('rewire');
var sinon = require('sinon');
var semanticInferModule = rewire('../../modules/semantic-infer/semantic_infer');
const constants = require('../../modules/semantic-infer/constants');

describe('Semantic Infer', function() {

    let find_match, find_header_match_datatype, find_values_match_datatype, semantically_classify_field;
    const INT_HEADER_PATTERNS = constants.INT_HEADER_PATTERNS;
    const INT_HEADER_SEMANTIC_LABELS = constants.INT_HEADER_SEMANTIC_LABELS;
    const STRING_HEADER_PATTERNS = constants.STRING_HEADER_PATTERNS;
    const STRING_HEADER_SEMANTIC_LABELS = constants.STRING_HEADER_SEMANTIC_LABELS;
	const DATE_HEADER_PATTERNS = constants.DATE_HEADER_PATTERNS;
	const DATE_HEADER_SEMANTIC_LABELS = constants.DATE_HEADER_SEMANTIC_LABELS;
	const INT_VALUE_SEMANTIC_LABELS = constants.INT_VALUE_SEMANTIC_LABELS;
	const INT_VALUE_PATTERNS = constants.INT_VALUE_PATTERNS;
	const STRING_VALUE_SEMANTIC_LABELS = constants.STRING_VALUE_SEMANTIC_LABELS;
	const STRING_VALUE_PATTERNS = constants.STRING_VALUE_PATTERNS;
	
    describe('find_match function', function () {

        before(function(){
            find_match = semanticInferModule.__get__('find_match');
            find_match = sinon.spy(find_match);
            semanticInferModule.__set__('find_match', find_match);
        });

        it('should return none when no match', function(done) {
            const result = find_match('', [/\d/], ['test_output']);
            // logger.info('result: ', result);
            result.should.eql('none');
            done();
        });

        it('should return value when match found', function(done) {
			const result = find_match('test', [/.*ES?T/i], ['test_output']);
			// logger.info('result: ', result);
			result.should.eql('test_output');
            done();
        });

    });

    describe('find_header_match_datatype function', function () {
        let stubInferModule = {}, find_match_stub;

        before(function(){
            find_match_stub = sinon.stub();
            semanticInferModule.__set__('find_match', find_match_stub);

            find_header_match_datatype = semanticInferModule.__get__('find_header_match_datatype');
            find_header_match_datatype = sinon.spy(find_header_match_datatype);
            semanticInferModule.__set__('find_header_match_datatype', find_header_match_datatype);
        });

        it('should return none when no matching data type', function(done) {
            let val = '', dt = null;
            const result = find_header_match_datatype(val, dt);
            // logger.info('result: ', result);
			find_match_stub.calledOnce.should.be.false;
			result.should.eql('none');
            done();
        });

        it('should call find_match function with expected param values when called with data type integer', function(done) {
            let val = '', dt = 'integer';
            const result = find_header_match_datatype(val, dt);
            // logger.info('result: ', result);
			find_match_stub.calledOnce.should.be.true;
            find_match_stub.firstCall.args[1].should.eql(INT_HEADER_PATTERNS);
            find_match_stub.firstCall.args[2].should.eql(INT_HEADER_SEMANTIC_LABELS);
            done();
        });
		it('should call find_match function with expected param values when called with data type string', function(done) {
            let val = '', dt = 'string';
            const result = find_header_match_datatype(val, dt);
            // logger.info('result: ', result);
			find_match_stub.calledTwice.should.be.true;
            find_match_stub.secondCall.args[1].should.eql(STRING_HEADER_PATTERNS);
            find_match_stub.secondCall.args[2].should.eql(STRING_HEADER_SEMANTIC_LABELS);
            done();
        });
		it('should call find_match function with expected param values when called with data type date', function(done) {
            let val = '', dt = 'date';
            const result = find_header_match_datatype(val, dt);
            // logger.info('result: ', result);
			find_match_stub.calledThrice.should.be.true;
            find_match_stub.thirdCall.args[1].should.eql(DATE_HEADER_PATTERNS);
            find_match_stub.thirdCall.args[2].should.eql(DATE_HEADER_SEMANTIC_LABELS);
            done();
        });
    });
	describe('find_values_match_datatype function', function () {
        let stubInferModule = {}, find_match_stub;

        before(function(){
            find_match_stub = sinon.stub();
            semanticInferModule.__set__('find_match', find_match_stub);

            find_values_match_datatype = semanticInferModule.__get__('find_values_match_datatype');
            find_values_match_datatype = sinon.spy(find_values_match_datatype);
            semanticInferModule.__set__('find_values_match_datatype', find_values_match_datatype);
        });

        it('should return none when no matching data type', function(done) {
            let vals = [''], dt = null;
            const result = find_values_match_datatype(vals, dt);
            // logger.info('result: ', result);
			find_match_stub.calledOnce.should.be.false;
			result.should.eql('none');
            done();
        });
		
		it('should return none when vals is not an array', function(done) {
            let vals = 'asdf', dt = 'string';
            const result = find_values_match_datatype(vals, dt);
            // logger.info('result: ', result);
			find_match_stub.calledOnce.should.be.false;
			result.should.eql('none');
            done();
        });
		
		it('should return none when vals is an empty array', function(done) {
            let vals = [], dt = 'string';
            const result = find_values_match_datatype(vals, dt);
            // logger.info('result: ', result);
			find_match_stub.calledOnce.should.be.false;
			result.should.eql('none');
            done();
        });
		
		it('should call find_match function with expected param values when called with data type integer', function(done) {
            let vals = ['4','5'], dt = 'integer';
			find_match_stub.returns('none');
            const result = find_values_match_datatype(vals, dt);
            //logger.info('result: ', result);
			find_match_stub.calledTwice.should.be.true;
            find_match_stub.firstCall.args[1].should.eql(INT_VALUE_PATTERNS);
            find_match_stub.firstCall.args[2].should.eql(INT_VALUE_SEMANTIC_LABELS);
            done();
        });
		it('should call find_match function with expected param values when called with data type string', function(done) {
            let vals = ['test1'], dt = 'string';
			find_match_stub.returns('none');
            const result = find_values_match_datatype(vals, dt);
            //logger.info('result: ', result);
			find_match_stub.calledThrice.should.be.true;
            find_match_stub.thirdCall.args[1].should.eql(STRING_VALUE_PATTERNS);
            find_match_stub.thirdCall.args[2].should.eql(STRING_VALUE_SEMANTIC_LABELS);
            done();
        });
		it('should return a label if the threshold is met', function(done) {
            let vals = ['V8R15G','V9R17G','adf'], dt = 'string';
			find_match_stub.withArgs('V8R15G').returns({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
			find_match_stub.withArgs('V9R17G').returns({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
			find_match_stub.returns('none');
            const result = find_values_match_datatype(vals, dt);
            //logger.info('result: ', result);
			result.should.eql({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
            done();
        });
		it('should NOT return a label if the threshold is NOT met', function(done) {
            let vals = ['V8R15G','dfsfs','adf'], dt = 'string';
			find_match_stub.withArgs('V8R15G').returns({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
			find_match_stub.returns('none');
            const result = find_values_match_datatype(vals, dt);
            //logger.info('result: ', result);
			result.should.eql('none');
            done();
        });
		it('should return the label that has the most matches', function(done) {
            let vals = ['V8R15G','V9R17G','male'], dt = 'string';
			find_match_stub.withArgs('V8R15G').returns({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
			find_match_stub.withArgs('V9R17G').returns({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
			find_match_stub.withArgs('male').returns({name:'Gender',rdfType:'https://schema.org/gender',var_class:'research_content',th:0.2});
			find_match_stub.returns('none');
            const result = find_values_match_datatype(vals, dt);
            //logger.info('result: ', result);
			result.should.eql({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
            done();
        });
	});
	describe('semantically_classify_field function', function () {
		let stubInferModule = {}, find_header_match_datatype, find_values_match_datatype_stub;
        before(function(){
            find_header_match_datatype_stub = sinon.stub();
            semanticInferModule.__set__('find_header_match_datatype', find_header_match_datatype_stub);
			
			find_values_match_datatype_stub = sinon.stub();
            semanticInferModule.__set__('find_values_match_datatype', find_values_match_datatype_stub);
			
			semantically_classify_field = semanticInferModule.__get__('semantically_classify_field');
            semantically_classify_field = sinon.spy(semantically_classify_field);
            semanticInferModule.__set__('semantically_classify_field', semantically_classify_field);
        });

        it('should return none when no match', function(done) {
            let fn = 'myfieldname', vals = ['bas','dasf','daf'], dt = 'string';
			find_header_match_datatype_stub.returns('none');
			find_values_match_datatype_stub.returns('none');
			const result = semantically_classify_field(fn, vals, dt);
            // logger.info('result: ', result);
            result.should.eql('none');
            done();
        });

        it('should return the header value if a header match is found', function(done) {
            let fn = 'PostalCode', vals = ['male','female','male'], dt = 'string';
			find_header_match_datatype_stub.returns({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
			find_values_match_datatype_stub.returns({name:'Gender',rdfType:'https://schema.org/gender',var_class:'research_content',th:0.2});
			const result = semantically_classify_field(fn, vals, dt);
            // logger.info('result: ', result);
			result.should.eql({name:'Postal code',rdfType:'https://schema.org/postalCode',var_class:'indirect_identifier',th:0.5});
            done();
        });
		it('should return the value match label if a header match is none', function(done) {
            let fn = 'asdf', vals = ['male','female','male'], dt = 'string';
			find_header_match_datatype_stub.returns('none');
			find_values_match_datatype_stub.returns({name:'Gender',rdfType:'https://schema.org/gender',var_class:'research_content',th:0.2});
			const result = semantically_classify_field(fn, vals, dt);
            // logger.info('result: ', result);
			result.should.eql({name:'Gender',rdfType:'https://schema.org/gender',var_class:'research_content',th:0.2});
            done();
        });
    });
});
