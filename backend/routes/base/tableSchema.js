var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, cache){

    const util = require('./util');
    const requiredPhase = 2

    const transformResources = function (resources) {

        resources = resources.map(item => {
            if (item.schema && item.schema['$schema']){
                item.schema.schema = item.schema['$schema'];
                delete item.schema['$schema'];
            }
            let newItem = {...item, tableSchema: {...item.schema}};
            delete newItem.schema;
            return newItem;
        });
        return resources;
    }
    
    const transformResourcesToFrictionless = function (resources) {
    
        resources = resources.map(item => {
            let newItem = {...item, schema: {...item.tableSchema}};
            delete newItem.tableSchema;
            return newItem;
        });
        return resources;
    }

    const addDataPackageFromTableSchema = async function(schema) {

        let resources = [
            {
                profile: "tabular-data-resource",
                data: [],
                schema: schema
            }
        ];

        let dataPackageSchema = new db.DataPackageSchema;
        dataPackageSchema.profile = 'tabular-data-package';
        let r = transformResources([...resources]);
        dataPackageSchema.resources = r;
        dataPackageSchema.version = schema.version;

        return await dataPackageSchema.save().catch (e => {
            throw e;
        });
    }

    router.post('/', auth.requireLoggedIn, async function(req, res, next){
        let schema = {...req.body};
        const pkg = await addDataPackageFromTableSchema(schema);
        res.status(201).json({id: pkg._id.toString()});
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};