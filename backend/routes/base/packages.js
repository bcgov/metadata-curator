var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, ValidationError, cache){

    const log = require('npmlog');
    
    const {Package, Resource} = require('datapackage');
    const {Schema} = require('tableschema');
    const mongoose = require('mongoose');

    const util = require('./util');
    const requiredPhase = 2

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

        try{
            let d = await dataPackageSchema.save();
            return d;
        }catch(e){
            console.log("caught", e);
            if (e instanceof mongoose.Error.ValidationError) {
                throw new ValidationError("DB Validation Error", e.errors);
            } else {
                throw e;
            }
        }
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

        //let dataPackageSchema = await db.DataPackageSchema.findOne({_id: id});
        let filter = {_id: id};
        let data = {}

        data.profile = descriptor.profile;
        let k = Object.keys(descriptor);
        let dontSet = ['resources', '_id', '__v', 'version'];
        for (let i=0; i<k.length; i++){
            let key = k[i];
            if (dontSet.indexOf(key) === -1){
                data[key] = descriptor[key]
            }
        }

        data.resources = /*transformResources(*/descriptor.resources/*);*/

        let newRecord = await db.DataPackageSchema.findOneAndUpdate(filter, data, {new: true}).catch (e => {
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

    const getDataPackageByBranchId = async function (id, user) {
        // Return a lean() object - simple javascript object, rather than the Model
        // so we can transform the document into a valid data package

        const branch = await db.RepoBranchSchema.findOne({_id: id});

        if ( (!branch || !branch.published) && (!user) ){
            throw new Error('404')
        }

        const current = await db.DataPackageSchema.findOne({version: id}).lean().catch (e => {
            log.error(e);
            throw new Error(e.message)
        });

        return current;
    }

    const listDataPackages = async function (query) {
        // Return a lean() object - simple javascript object, rather than the Model
        // so we can transform the document into a valid data package

        let q = {
            inferred: false,
        };
        if (query.upload_id){
            try{
                let uploadId = mongoose.Types.ObjectId(query.upload_id);
                //console.log("UPLO", uploadId);
                const version = await db.RepoBranchSchema.find({data_upload_id: uploadId});
                //console.log("VER", version);
                if (version && version.length && version[version.length-1] && version[version.length-1]._id){
                    let verIds = [];
                    for (let i=0; i<version.length; i++){
                        verIds.push(version[i]._id);
                    }
                    q = {version: {$in: verIds} };
                }else{
                    return [];
                }
            }catch(e){
                return [];
            }
        }

        const list = await db.DataPackageSchema.find(q).lean().catch (e => {
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

        if (descriptor.resources && typeof(descriptor.resources) === "object"){
            dataPackageSchema.resources = transformResources([...descriptor.resources]);
        }

        let protected = ['resources'];
        let keys = Object.keys(descriptor);
        for (let i=0; i<keys.length; i++){
            let k = keys[i];
            if (protected.indexOf(k) === -1){
                // console.log("adding ", k, " to datapackageSchema", descriptor[k]);
                dataPackageSchema[k] = descriptor[k];
            }
        }
        return dataPackageSchema;
    }
    
    router.get('/', auth.requireLoggedIn, async function(req, res, next) {
        res.status(200).json(await listDataPackages(req.query));
    });

    router.post('/', auth.requireLoggedIn, async function(req, res, next){
        let descriptor = {...req.body};
        descriptor.profile = "tabular-data-package";


        const pkg = await addDataPackage(descriptor);
        res.status(201).json({id: pkg._id.toString()});
    });

    router.put('/:id', auth.requireLoggedIn, async function(req, res, next){
        let descriptor = {...req.body};
        descriptor.profile = "tabular-data-package";
        const pkg = await updateDataPackage(req.params.id, descriptor)
        res.status(200).json({id: pkg._id.toString()});
    });

    router.get('/branch', auth.requireLoggedIn, async function(req, res, next){
        res.status(200).json(await listDataPackages(req.query));
    });

    router.get('/:dataPackageId', auth.requireLoggedIn, async function(req, res, next){
        const id = req.params.dataPackageId;
        res.status(200).json(await getDataPackageById(id));
    });

    router.get('/branch/:branchId', async function(req, res, next){
        const id = req.params.branchId;
        try{
            return res.status(200).json(await getDataPackageByBranchId(id, req.user));
        }catch(ex){
            if (ex.message === "404"){
                return res.status(404).json({error: "Not found"});
            }
            return res.status(500).json({error: ex});
        }
    });

    router.delete('/:dataPackageId', auth.requireLoggedIn, auth.requireAdmin, async function(req, res, next){
        const id = req.params.dataPackageId;
        res.status(204).json(await deleteDataPackage(id));
    });    

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};