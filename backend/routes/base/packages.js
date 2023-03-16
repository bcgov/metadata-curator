const mongoose = require("mongoose");
const log = require("npmlog");
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

                const uniqueResources = new Set(descriptor.resources.map(v => v.name));
                if(uniqueResources.size < descriptor.resources.length){
                    throw new Error("Resource Names Must Be Unique");
                }
            } else {
                let newVal = [];
                resourceErrsMap.set('package', newVal);
            }
        }

        return dataPackage;
    }

    const addDataPackage = async function(descriptor, user) {
        await validateDataPackage(descriptor);
        let revision = new db.RevisionSchema();
        
        if (descriptor.inferred){
            let preInferred = await db.DataPackageSchema.findOne({inferred: true, version: descriptor.version});
            if (preInferred){
                let dataPackageSchema = await buildDataPackageSchema(descriptor, true, revision);
                let d = await db.DataPackageSchema.updateOne({_id: preInferred._id}, dataPackageSchema);
                if (!d._id){
                    dataPackageSchema._id = preInferred._id;
                    return dataPackageSchema;
                }
                
                return d;
            }
        }

        
        revision.old_content = {};
        revision.updater = user.id;
        revision.type = "tabular_data_package";
        revision.revision_number = 0;
        revision.create_date = new Date();

        let dataPackageSchema = await buildDataPackageSchema(descriptor, true, revision);

        const branch = await db.RepoBranchSchema.findOne({_id: mongoose.Types.ObjectId(dataPackageSchema.version)});
        if (!branch){
            throw new Error("No version");
        }else if ( (branch.approved) && (!user.isAdmin)){
            throw new Error("The branch is approved no metadata changes")
        }

        try{
            let d = await db.DataPackageSchema.create(dataPackageSchema);
            revision.source_id = d._id;
            await revision.save();
            return d;
        }catch(e){
            if (e instanceof mongoose.Error.ValidationError) {
                throw new ValidationError("DB Validation Error", e.errors);
            } else {
                throw e;
            }
        }
    }

    const deleteDataPackage = async function(id, user) {
        if (!user.isAdmin){
            throw new Error("Not allowed to delete packages")
        }
        const current = await db.DataPackageSchema.findOne({_id: id});
        if (!current) {
            throw new Error("Data package not found")
        }
        await current.delete();
    }

    const updateDataPackage = async function (id, descriptor, user) {
        
        await validateDataPackage(descriptor);

        //let dataPackageSchema = await db.DataPackageSchema.findOne({_id: id});
        let filter = {_id: id};

        let oldRecord = await db.DataPackageSchema.findOne(filter);
        let data = {};

        let existingRevisions = await db.RevisionSchema.find({source_id: mongoose.Types.ObjectId(id), type: 'tabular_data_package'});
        let revision = new db.RevisionSchema();
        revision.old_content = JSON.parse(JSON.stringify(oldRecord));
        revision.source_id = mongoose.Types.ObjectId(id);
        revision.updater = user.id;
        revision.type = "tabular_data_package";
        revision.revision_number = (existingRevisions && existingRevisions.length) ? existingRevisions.length : 0;
        revision.create_date = new Date();

        revision.revise('profile', oldRecord.profile, descriptor.profile);
        data.profile = descriptor.profile;
        let k = Object.keys(descriptor);
        let dontSet = ['resources', '_id', '__v', 'version'];
        for (let i=0; i<k.length; i++){
            let key = k[i];
            if (dontSet.indexOf(key) === -1){
                revision.revise(key, data[key], descriptor[key]);

                data[key] = descriptor[key].replace(/\//g, '\/');
            }
        }

        console.log("about to transform");

        data.resources = transformResources(descriptor.resources);
        revision.revise('resources', oldRecord.resources, data.resources);
        console.log("post to transform");
        
        let branchQ = {};
        if (descriptor.version){
            revision.revise('resources', oldRecord.version, descriptor.version);
            let branchId = mongoose.Types.ObjectId(descriptor.version);
            branchQ = {_id: branchId}
            
        }else{
            let branchId = mongoose.Types.ObjectId(oldRecord.version);
            branchQ = {_id: branchId}
        }

        console.log("PUT ABOUT TO FIND, data", branchQ);
        
        const branch = await db.RepoBranchSchema.findOne(branchQ);
        if (!branch){
            throw new Error("No version");
        }else if ( (branch.approved) && (!user.isAdmin)){
            throw new Error("The branch is approved no metadata changes")
        }

        console.log("PUT ABOUT TO SAVE, data", data);

        let newRecord = await db.DataPackageSchema.findOneAndUpdate(filter, data, {new: true}).catch (e => {
            log.error(e);
            throw new Error(e.message)
        });

        console.log("PUT AFTER SAVE, data", data);

        const util = require('util')

        
        newRecord = newRecord.toObject();

        // do a transformation to make it compatible with the frictionlessdata schema
        newRecord.resources = transformResourcesToFrictionless(newRecord.resources);

        //if change_summary is set there is at least one change
        if (revision.change_summary){
            await revision.save();
        }

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

    const getDataPackageByResourceNameValue = async function (fieldOrValue) {
        var dataPackages = [];
        var uploads = [];

        var dataPackagesWValueInName = await db.DataPackageSchema.find({'resources.tableSchema.fields.name': {'$regex': fieldOrValue, '$options': 'i'}}).lean().catch(e => {
            log.error(e);
            throw new Error(e.message)
        });
        dataPackages.push.apply(dataPackages, dataPackagesWValueInName);
        var dataPackagesWValueInValue = await db.DataPackageSchema.find({'resources.tableSchema.fields.constraints.enum': {'$regex': fieldOrValue, '$options': 'i'}}).lean().catch(e => {
            log.error(e);
            throw new Error(e.message)
        });
        dataPackages.push.apply(dataPackages, dataPackagesWValueInValue);

        for (const dataPackage of dataPackages){
            const repo_branch = await db.RepoBranchSchema.findOne({_id: dataPackage.version}).lean().catch(e => {
                log.error(e);
                throw new Error(e.message)
            });
            const data_upload = await db.DataUploadSchema.findOne({_id: repo_branch.data_upload_id}).lean().catch(e => {
                log.error(e);
                throw new Error(e.message)
            });
            uploads.push(data_upload);
        }

        const seen = new Set();
        const uniqueUploads = uploads.filter(el => {
            if (el !== null) {
                const duplicate = seen.has(el.name);
                seen.add(el.name);
                return !duplicate;
            }
        });

        return uniqueUploads;
    }

    const getDataPackageByBranchId = async function (id, user, inferred) {
        // Return a lean() object - simple javascript object, rather than the Model
        // so we can transform the document into a valid data package
        inferred = (typeof(inferred) !== 'undefined') ? inferred : false;
        const branch = await db.RepoBranchSchema.findOne({_id: id});
        id = mongoose.Types.ObjectId(id);

        if ( (!branch || !branch.published) && (!user) ){
            throw new Error('404')
        }

        let current = null;
        if (!inferred){
            inferred = {
                $in: ['false', null, false]
            };
        }
        let q = {version: id, inferred: inferred}
        try{
            current = await db.DataPackageSchema.findOne(q).lean()
            if (!current){
                return current;
            }
            current.resources = transformResourcesToFrictionless(current.resources);
        }catch(e){
            throw e
        }

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
                const version = await db.RepoBranchSchema.find({data_upload_id: uploadId});
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

        if (query.inferred){
            q.inferred = query.inferred;
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
            if (item.schema){
                let newItem = {...item, tableSchema: {...item.schema}};
                delete newItem.schema
                return newItem;
            }
            return item;
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

    const buildDataPackageSchema = async function (descriptor, object, revision) {
        await validateDataPackage(descriptor);

        let dataPackageSchema =  object ? {} : new db.DataPackageSchema;
        revision.revise('profile', dataPackageSchema.profile, descriptor.profile);
        dataPackageSchema.profile = descriptor.profile;
        

        if (descriptor.resources && typeof(descriptor.resources) === "object"){
            let r = transformResources([...descriptor.resources]);
            revision.revise('resources', dataPackageSchema.resources, descriptor.profile);
            dataPackageSchema.resources = JSON.parse(JSON.stringify(r));
        }

        let protected = ['resources'];
        let keys = Object.keys(descriptor);
        for (let i=0; i<keys.length; i++){
            let k = keys[i];
            if (protected.indexOf(k) === -1){
                revision.revise(k, dataPackageSchema[k] , descriptor[k]);
                dataPackageSchema[k] = descriptor[k];
            }
        }
        return dataPackageSchema;
    }
    
    router.get('/', auth.requireLoggedIn, async function(req, res, next) {
        try{
            res.status(200).json(await listDataPackages(req.query));
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.post('/', auth.requireLoggedIn, async function(req, res, next){
        try{
            let descriptor = {...req.body};
            descriptor.profile = "tabular-data-package";


            const pkg = await addDataPackage(descriptor, req.user);
            res.status(201).json({id: pkg._id.toString()});
        }catch(ex){
            console.error("Post DP", ex);
            res.status(500).json({error: ex});
        }
    });

    router.put('/:id', auth.requireLoggedIn, async function(req, res, next){
        try{
            let descriptor = {...req.body};
            descriptor.profile = "tabular-data-package";
            const pkg = await updateDataPackage(req.params.id, descriptor, req.user)
            res.status(200).json({id: pkg._id.toString()});
        }catch(ex){
            console.log("PUT dp", ex);
            res.status(500).json({error: ex.message});
        }
    });

    router.get('/branch', auth.requireLoggedIn, async function(req, res, next){
        try{
            res.status(200).json(await listDataPackages(req.query));
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/:dataPackageId', auth.requireLoggedIn, async function(req, res, next){
        try{
            const id = req.params.dataPackageId;
            res.status(200).json(await getDataPackageById(id));
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/resource/:fieldNameValue', auth.requireLoggedIn, async function(req, res, next){
        try{
            const nameOrValue = req.params.fieldNameValue;
            return res.status(200).json(await getDataPackageByResourceNameValue(nameOrValue));
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/:dataPackageId/revisions', async function(req, res, next){
        try{
            let revs = await db.RevisionSchema.find({source_id: mongoose.Types.ObjectId(req.params.dataPackageId), type: 'tabular_data_package'});
            return res.json({revisions: revs});
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/branch/:branchId', async function(req, res, next){
        const id = req.params.branchId;
        const inferred = (req.query && req.query.inferred) ? req.query.inferred : false;
        try{
            return res.status(200).json(await getDataPackageByBranchId(id, req.user, inferred));
        }catch(ex){
            if (ex.message === "404"){
                return res.status(404).json({error: "Not found"});
            }
            return res.status(500).json({error: ex});
        }
    });

    router.delete('/:dataPackageId', auth.requireLoggedIn, auth.requireAdmin, async function(req, res, next){
        try{
            const id = req.params.dataPackageId;
            res.status(204).json(await deleteDataPackage(id, req.user));
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });    

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};