var buildStatic = function(db, router){
    return router;
}

var buildDynamic = function(db, router, auth){
    
    const getBranches = async function(data_upload_id){
        var q = {};
        if (typeof(data_upload_id) !== "undefined"){
            q.data_upload_id = mongoose.Types.ObjectId(data_upload_id);
        }
    
        return await db.RepoBranchSchema.find(q).sort({ "create_date": 1});
    }
    
    const updateBranch = async function(branchId, type, name, description, upload_id) {
        const repoBranchSchema = await getBranchById(branchId);
        if (type){
            repoBranchSchema.type = type;
        }
        
        if (name){
            repoBranchSchema.name = name;
        }
    
        if (description){
            repoBranchSchema.description = description;
        }
        
        if (upload_id){
            repoBranchSchema.data_upload_id = upload_id;
        }
        
        return await repoBranchSchema.save();
    }
    
    const getBranchById = async (id) => {
        try {
            return await db.RepoBranchSchema.findOne({_id: id});
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }
    
    const deleteBranch = async (id) => {
        const branch = await db.RepoBranchSchema.findOne({_id: id});
        if (branch.revisions.length != 0) {
            throw new Error("Unable to delete a branch that has revisions")
        }
        return await db.RepoBranchSchema.delete({_id: id});
    }
    
    router.get('/', async function(req, res, next) {
        const branches = await getBranches(req.query.data_upload_id);
        res.status(200).json(branches);
    });

    router.get('/:branchId', async function(req, res, next) {
        const branch = await getBranchById(req.params.branchId);
        res.status(200).json(branch);
    });

    router.put('/:branchId', async function(req, res, next) {
        let f = {...req.body};
        const result = await updateBranch(req.params.branchId, f.type, f.name, f.description);
        res.status(200).json(result);
    });

    router.delete('/:branchId', async function(req, res, next) {
        await deleteBranch(req.params.branchId);
        res.status(204).send();
    });

    router.post('/:branchId/revisions', async function(req, res, next) {
        let f = {...req.body};
        const branchId = req.params.branchId;
        const branch = await getBranchById(branchId);
        const rev = await revisionService.createRevisionWithDataPackage(branch, f.change_summary, f.updater, f.descriptor)
    
        res.status(201).json({
            id: rev._id.toString()
        });
    });

    router.get('/:branchId/revisions', async function(req, res, next) {
        const branchId = req.params.branchId;
        await getBranchById(branchId);
        const revisions = await revisionService.listRevisionsByBranch(branchId);
        res.status(200).json(revisions);
    });

    router.put('/:branchId/revisions/:revId', async function(req, res, next) {
        let f = {...req.body};
        const branchId = req.params.branchId;
        const revId = req.params.revId;
        await getBranchById(branchId);
        const rev = await revisionService.updateRevision(revId, f.changeSummary, f.updater)
    
        res.status(200).json(rev);
    });

    router.delete('/:branchId/revisions/:revId', async function(req, res, next) {
        const branchId = req.params.branchId;
        const revId = req.params.revId;
        await getBranchById(branchId);
        await revisionService.deleteRevision(revId)
        res.status(204).send();
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};