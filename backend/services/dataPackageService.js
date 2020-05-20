

const mongoose = require('mongoose');
const db = require('../db/db');
let log = require('npmlog');
const {Package, Resource} = require('datapackage');
const tableSchemaService = require('./tableSchemaService');

const validateDataPackage = async function (descriptor) {
    const dataPackage = await Package.load(descriptor, {strict: false});

    if (!dataPackage.valid) {
        let errs = [];
        let resourceErrsMap = new Map();

        if (descriptor.resources && descriptor.resources.length > 0) {
            for (const resource of descriptor.resources) {
                const rsrc = await Resource.load(resource, {strict: false});
                const rsrcValid = rsrc.valid;

                if (!rsrcValid) {
                    const validations = await tableSchemaService.formatValidation(rsrc);
                    validations.forEach(element => {
                        element.resourceName = resource.name;
                    });
                    let val = resourceErrsMap.get(resource.name);
                    if (val) {
                        validations.forEach(err => val.push(err));
                        resourceErrsMap.set(resource.name, val);
                    } else {
                        let newVal = [];
                        validations.forEach(err => newVal.push(err));
                        resourceErrsMap.set(resource.name, newVal);
                    }
                }
            }
        } else {
            const validations = await tableSchemaService.formatValidation(dataPackage);
            validations.forEach(err => errs.push(err));
        }

        throw new Error("Validation errors " + JSON.stringify(errs) + " -- " + JSON.stringify([...resourceErrsMap]))
        // res.status(400);
        // res.json({
        //     status: 400,
        //     error: {
        //         message: "Unable to save tabular data package.  Failed validation.",
        //         validationErrors: errs,
        //         validationErrorsByResource: [...resourceErrsMap]
        //     }
        // });
//        return;
    }

    return dataPackage;
}

const addDataPackage = async function(descriptor) {
    await validateDataPackage(descriptor);

    let dataPackageSchema = new db.DataPackageSchema;
    // let resources = [...descriptor.resources];

    // resources = resources.map(item => {
    //     let newItem = {...item, tableSchema: {...item.schema}};
    //     return newItem;
    // });

    dataPackageSchema.profile = descriptor.profile;
    dataPackageSchema.resources = transformResources([...descriptor.resources]);


    return await dataPackageSchema.save().catch (e => {
        if (e instanceof mongoose.Error.ValidationError) {
            throw new Error("MongoDB Validation Error - " + JSON.stringify(e.errors));
        } else {
            throw e;
        }
    });
}

const updateDataPackage = async function (id, descriptor) {
    await validateDataPackage(descriptor);


    const dataPackageSchema = await db.DataPackageSchema.findOne({_id: id});

    // let resources = [...descriptor.resources];

    // resources = resources.map(item => {
    //     let newItem = {...item, tableSchema: {...item.schema}};
    //     return newItem;
    // });

    dataPackageSchema.profile = descriptor.profile;
    dataPackageSchema.resources = transformResources([...descriptor.resources]);

//    ['profile','resources'].forEach(a => current[a] = descriptor[a]);

    // do a transformation to make it compatible with the frictionlessdata schema
    //current.resources.forEach(r => { r.tableSchema = r.schema; delete r.schema; })

    let newRecord = await dataPackageSchema.save().catch (e => {
        log.error(e);
        throw new Error(e.message)
    });

    newRecord = newRecord.toObject();

    // do a transformation to make it compatible with the frictionlessdata schema
    newRecord.resources = transformResourcesToFrictionless(newRecord.resources);

    return newRecord;

//    return newRecord.toObject({transform: (t => { if ('tableSchema' in t) { t.schema = t.tableSchema; delete t.tableSchema;}; return t;})});
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

module.exports = {
    addDataPackage,
    updateDataPackage,
    getDataPackageById,
    listDataPackages
}

