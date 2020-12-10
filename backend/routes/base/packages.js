var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, ValidationError){

    
    const {Package, Resource} = require('datapackage');
    const {Schema} = require('tableschema');

    const validateDataPackage = async function (descriptor) {
        const dataPackage = await Package.load(descriptor, {strict: false});

        if (!dataPackage.valid) {
            let resourceErrsMap = new Map();

            if (descriptor.resources && descriptor.resources.length > 0) {
                for (const resource of descriptor.resources) {
                    const rsrc = await Resource.load(resource, {strict: false});
                    const rsrcValid = rsrc.valid;

                    if (!rsrcValid) {
                    }
                }
            } else {
                let newVal = [];
                resourceErrsMap.set('package', newVal);
            }
        }

        return dataPackage;
    }

    const addDataPackage = async function(descriptor) {
        await validateDataPackage(descriptor);

        const dataPackageSchema = await buildDataPackageSchema(descriptor);

        return await dataPackageSchema.save().catch (e => {
            if (e instanceof mongoose.Error.ValidationError) {
                throw new ValidationError("DB Validation Error", e.errors);
            } else {
                throw e;
            }
        });
    }

    const deleteDataPackage = async function(id) {
        const current = await db.DataPackageSchema.findOne({_id: id});
        if (!current) {
            throw new Error("Data package not found")
        }
        await current.delete();
    }

    const updateDataPackage = async function (id, descriptor) {
        await validateDataPackage(descriptor);

        const dataPackageSchema = await db.DataPackageSchema.findOne({_id: id});

        dataPackageSchema.profile = descriptor.profile;
        dataPackageSchema.resources = transformResources([...descriptor.resources]);

        let newRecord = await dataPackageSchema.save().catch (e => {
            log.error(e);
            throw new Error(e.message)
        });

        newRecord = newRecord.toObject();

        // do a transformation to make it compatible with the frictionlessdata schema
        newRecord.resources = transformResourcesToFrictionless(newRecord.resources);

        return newRecord;
    }

    const getDataPackageById = async function (id) {
        // Return a lean() object - simple javascript object, rather than the Model
        // so we can transform the document into a valid data package
        const current = await db.DataPackageSchema.findOne({_id: id}).lean().catch (e => {
            log.error(e);
            throw new Error(e.message)
        });

        // do a transformation to make it compatible with the frictionlessdata schema
        current.resources = transformResourcesToFrictionless(current.resources);

        return current;
    }

    const listDataPackages = async function () {
        // Return a lean() object - simple javascript object, rather than the Model
        // so we can transform the document into a valid data package
        const list = await db.DataPackageSchema.find().lean().catch (e => {
            log.error(e);
            throw new Error(e.message)
        });

        // do a transformation to make it compatible with the frictionlessdata schema
        list.forEach(dpkg => {
            dpkg.resources = transformResourcesToFrictionless(dpkg.resources);
        });

        return list;
    }

    const transformResources = function (resources) {

        resources = resources.map(item => {
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

    const buildDataPackageSchema = async function (descriptor) {
        await validateDataPackage(descriptor);

        let dataPackageSchema = new db.DataPackageSchema;
        dataPackageSchema.profile = descriptor.profile;
        dataPackageSchema.resources = transformResources([...descriptor.resources]);
        return dataPackageSchema;
    }
    
    router.get('/', async function(req, res, next) {
        res.status(200).json(await listDataPackages());
    });

    router.post('/', async function(req, res, next){
        let descriptor = {...req.body};
        descriptor.profile = "tabular-data-package";

        const pkg = await addDataPackage(descriptor);
        res.status(201).json({id: pkg._id.toString()});
    });

    router.get('/:dataPackageId', async function(req, res, next){
        const id = req.params.dataPackageId;
        res.status(200).json(await getDataPackageById(id));
    });

    router.delete('/:dataPackageId', auth.requireAdmin, async function(req, res, next){
        const id = req.params.dataPackageId;
        res.status(204).json(await deleteDataPackage(id));
    });    

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};