const {Package} = require('datapackage');

module.exports = {
	infer_datapackage: function(descriptor, strict=true) {
		return infer_datapackage(descriptor, strict);
	}
};

const infer_datapackage = async (descriptor, strict=true) => {
	
	const dataPackage = await Package.load(descriptor);
	const semanticinfer = require('./semantic_infer');
	const constants = require('./constants');
	const VAR_CLASS_ATTR = constants.VAR_CLASS_ATTR;
	const RDF_ATTR = constants.RDF_ATTR;
	const SAVED_PATH_ATTR = constants.SAVED_PATH_ATTR;
	var vals = [];
	var fieldVals = [];
	if (strict && !(dataPackage.valid)) {
		return 'invalid data package';
		// DataPackage rules: 
		// Datapackage object must have a "resources" array. 
		// Each resource must have a "name" field.
		// Each resource must have a "data" or "path" field (but not both).
		// Semantic inference rules:
		// Only resources with a "data" field will be sematically inferred.  
		// Providing a "SAVED_PATH_ATTR" attribute for data resources will result in the "data" field being replaced by a "path" field.
	}
	try {
		resources = Object.values(dataPackage.descriptor.resources);
		for (k = 0; k < resources.length; k++) {
			resource = resources[k];
			if (!("data" in resource)) {
				continue;
			}
			res = dataPackage.getResource(resource.name);
			await res.infer();
			dataPackage.descriptor.resources[k] = res.descriptor;
			vals = await res.read({keyed: true});
			for (j = 0; j < res.descriptor.schema.fields.length; j++) {
				field = res.descriptor.schema.fields[j];
				fieldVals = [];
				for (i = 0; i < vals.length; i++) {
					fieldVals.push(vals[i][field.name]);
				}
				s = semanticinfer.semantically_classify_field(field.name, fieldVals, field.type);
				if (s != 'none') {
					dataPackage.descriptor.resources[k].schema.fields[j][VAR_CLASS_ATTR] = s[VAR_CLASS_ATTR];
					if (RDF_ATTR in s) {
						dataPackage.descriptor.resources[k].schema.fields[j][RDF_ATTR] = s[RDF_ATTR];
					}
				}
			}
			if (SAVED_PATH_ATTR in resource) {
				delete dataPackage.descriptor.resources[k].data;
				dataPackage.descriptor.resources[k].path = resource[SAVED_PATH_ATTR];
				delete dataPackage.descriptor.resources[k][SAVED_PATH_ATTR];
			}
			else {
				return 'All resources with "data" attributes must have a saved path attribute of ' + SAVED_PATH_ATTR; 
			}
		}
		dataPackage.commit();
	} catch(err){console.log(err.message); console.log(dataPackage.errors);}
	return dataPackage.descriptor;
}