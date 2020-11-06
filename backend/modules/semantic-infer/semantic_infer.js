const anymatch = require('anymatch');
const constants = require('./constants');

const DATE_HEADER_SEMANTIC_LABELS = constants.DATE_HEADER_SEMANTIC_LABELS;
const DATE_HEADER_PATTERNS = constants.DATE_HEADER_PATTERNS;
const INT_HEADER_SEMANTIC_LABELS = constants.INT_HEADER_SEMANTIC_LABELS;
const INT_HEADER_PATTERNS = constants.INT_HEADER_PATTERNS;
const STRING_HEADER_SEMANTIC_LABELS = constants.STRING_HEADER_SEMANTIC_LABELS;
const STRING_HEADER_PATTERNS = constants.STRING_HEADER_PATTERNS;
const STRING_VALUE_SEMANTIC_LABELS = constants.STRING_VALUE_SEMANTIC_LABELS;
const STRING_VALUE_PATTERNS = constants.STRING_VALUE_PATTERNS;
const INT_VALUE_SEMANTIC_LABELS = constants.INT_VALUE_SEMANTIC_LABELS;
const INT_VALUE_PATTERNS = constants.INT_VALUE_PATTERNS;

module.exports = {
	semantically_classify_field: function(field_name, field_values, dt, debug = false) {
		return semantically_classify_field(field_name, field_values, dt, debug);
	}
};

function semantically_classify_field(field_name, field_values, dt, debug = false) {
		header_result = find_header_match_datatype(field_name, dt, debug);
		if (header_result != 'none') {
			return header_result;
		}
		else {
			return find_values_match_datatype(field_values, dt, debug);
		}
}

function find_header_match_datatype(val, dt, debug = false) {
	if (dt == 'integer') {
		return find_match(val, INT_HEADER_PATTERNS, INT_HEADER_SEMANTIC_LABELS, debug);
	}
	if (dt == 'date') {
		return find_match(val, DATE_HEADER_PATTERNS, DATE_HEADER_SEMANTIC_LABELS, debug);
	}
	if (dt == 'string') {
		return find_match(val, STRING_HEADER_PATTERNS, STRING_HEADER_SEMANTIC_LABELS, debug);
	}
	else {
		return 'none'
	}
}

function find_values_match_datatype(vals, dt, debug = false) {
	var i;
	var max_val;
	var result;
	var result_arr = [];
	var best_match_arr = [];
	var seen_it_arr = [];
	if (!(Array.isArray(vals))) { return 'none'; } 
	if (vals.length < 1) { return 'none'; }
	if (dt == 'string' || dt == 'integer') {
		for (i = 0; i < vals.length; i++) {
			if (dt == 'string') {
				result = find_match(vals[i], STRING_VALUE_PATTERNS, STRING_VALUE_SEMANTIC_LABELS, debug);
			}
			else {
				result = find_match(vals[i], INT_VALUE_PATTERNS, INT_VALUE_SEMANTIC_LABELS, debug);
			}
			if (result == 'none') { continue; }
			if (result.name in seen_it_arr) {
				seen_it_arr[result.name] = seen_it_arr[result.name] + 1;
			}
			else {
				seen_it_arr[result.name] = 1;
				result_arr[result.name] = result;
			}
		}
		if (debug) { console.log(seen_it_arr); }
		//calculate the percentage for each result name and then compare against threshold
		max_val = 0;
		for (key in seen_it_arr) {
			v = seen_it_arr[key]/vals.length;
			if (result_arr[key].th <= v) {
				if (v > max_val) {
					max_val = v;
					max_key = key;
				}					
				return result_arr[max_key];
			}
		}
		return 'none';
	}
	else {
		return 'none';
	}
}

function find_match(val, patterns, labels, debug = false) {
	index = anymatch(patterns, val + '', {returnIndex: true});
	if (index != -1) {
		if (debug) { console.log(patterns[index]);}
		return labels[index];
	}
	else {
		return 'none';
	}
}