var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var logger = require('npmlog');
var rewire = require("rewire");
var sinon = require("sinon");
var semanticInferModule = rewire('../../modules/semantic-infer/semantic_infer');
const constants = require('../../modules/semantic-infer/constants');

describe("Semantic Infer", function() {

    let find_match, find_header_match_datatype;
    const INT_HEADER_PATTERNS = constants.INT_HEADER_PATTERNS;
    const INT_HEADER_SEMANTIC_LABELS = constants.INT_HEADER_SEMANTIC_LABELS;

    describe('find_match function', function () {

        before(function(){
            find_match = semanticInferModule.__get__('find_match');
            find_match = sinon.spy(find_match);
            semanticInferModule.__set__('find_match', find_match);
        });

        it('should return none when no match', function(done) {
            const result = find_match('', INT_HEADER_PATTERNS, INT_HEADER_SEMANTIC_LABELS);
            // logger.info("result: ", result);
            result.should.have.valueOf('none');
            done();
        });

        it('should return value when match found', function(done) {

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
            // logger.info("result: ", result);
            find_match_stub.calledOnce.should.be.false;
            result.should.have.valueOf('none');
            done();
        });

        it('should call find_match function with expected param values when called with data type string', function(done) {
            let val = '', dt = "integer";
            const result = find_header_match_datatype(val, dt);
            // logger.info("result: ", result);
            find_match_stub.calledOnce.should.be.true;
            find_match_stub.firstCall.args[1].should.eql(INT_HEADER_PATTERNS);
            find_match_stub.firstCall.args[2].should.eql(INT_HEADER_SEMANTIC_LABELS);
            done();
        });

    });


});
