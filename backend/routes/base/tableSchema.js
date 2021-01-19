var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth){

    const addDataPackageFromTableSchema = async function(schemaDescriptor) {
        
        let schema = await Schema.load(schemaDescriptor);
        if (!schema.valid) {
        
        }

        let resources = [
            {
                profile: "tabular-data-resource",
                data: [],
                schema: schemaDescriptor
            }
        ];

        let dataPackageSchema = new db.DataPackageSchema;
        dataPackageSchema.profile = 'tabular-data-package';
        dataPackageSchema.resources = transformResources([...resources]);

        return await dataPackageSchema.save().catch (e => {
            if (e instanceof mongoose.Error.ValidationError) {
                throw new ValidationError("DB Validation Error", e.errors);
            } else {
                throw e;
            }
        });
    }

    router.post('/', auth.requireAdmin, async function(req, res, next){
        let descriptor = {...req.body};
        const pkg = await addDataPackageFromTableSchema(descriptor);
        res.status(201).json({id: pkg._id.toString()});
    });   

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};