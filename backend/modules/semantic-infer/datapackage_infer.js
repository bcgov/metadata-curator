const {Package} = require('datapackage');

module.exports = {
	infer_datapackage: function(descriptor, strict = false) {
		return main(descriptor, strict);
	}
};

const main = async (descriptor, strict=false) => {
	
	const dataPackage = await Package.load(descriptor);
	const semanticinfer = require('./semantic_infer');
	const constants = require('./constants');
	const VAR_CLASS_ATTR = constants.VAR_CLASS_ATTR;
	const RDF_ATTR = constants.RDF_ATTR;
	
	var vals = [];
	var fieldVals = [];
	if (strict && !(dataPackage.valid)) {
		return 'invalid data package';
		// rules: 
		// Datapackage object must have a "resources" array. 
		// Each resource must have a "name" field.
		// Each resource must have a "data" or "path" field (but not both).
		// Only resources with a "data" field will be sematically inferred.
	}
	try {
		resources = Object.values(dataPackage.descriptor.resources)
		for (k = 0; k < resources.length; k++) {
			resource = resources[k];
			if (!("data" in resource)) {
				continue;
			}
			res = dataPackage.getResource(resource.name);
			vals = await res.read({keyed: true});
			for (j = 0; j < resource.schema.fields.length; j++) {
				field = resource.schema.fields[j];
				fieldVals = [];
				for (i = 0; i < vals.length; i++) {
					fieldVals.push(vals[i][field.name]);
				}
				s = semanticinfer.sematically_classify_field(field.name, fieldVals, field.type);
				if (s != 'none') {
					dataPackage.descriptor.resources[k].schema.fields[j][VAR_CLASS_ATTR] = s[VAR_CLASS_ATTR];
					if (RDF_ATTR in s) {
						dataPackage.descriptor.resources[k].schema.fields[j][RDF_ATTR] = s[RDF_ATTR];
					}
				}
			}
		}
		dataPackage.commit();
	} catch(err){console.log(err.message); console.log(dataPackage.errors);}
	return dataPackage.descriptor;
}