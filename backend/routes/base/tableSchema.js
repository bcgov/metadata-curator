var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, cache){

    const util = require('./util');
    const requiredPhase = 2

    const addDataPackageFromTableSchema = async function(schema) {
        
        if (!schema.valid) {
            throw new ValidationError("Invalid Schema");
        }

        let resources = [
            {
                profile: "tabular-data-resource",
                data: [],
                schema: schema
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