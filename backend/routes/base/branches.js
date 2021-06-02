var buildStatic = function(db, router){
    return router;
}

var buildDynamic = function(db, router, auth, revisionService, cache){

    let mongoose = require('mongoose');

    let log = require('npmlog');

    const util = require('./util');
    const requiredPhase = 2;

    const addBranch = async function(repoId, type, name, description, upload_id) {
        const repoBranchSchema = new db.RepoBranchSchema;
        repoBranchSchema.repo_id = repoId;
        repoBranchSchema.type = type;
        repoBranchSchema.name = name;
        repoBranchSchema.description = description;
        repoBranchSchema.data_upload_id = upload_id;
        repoBranchSchema.create_date = new Date();
    
        return await repoBranchSchema.save();
    }
    
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
        return await db.RepoBranchSchema.deleteOne({_id: id});
    }

    const listBranches = async (repoId) => {
        try {
            return await db.RepoBranchSchema.find({repo_id:repoId}).sort({ "create_date": 1});
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }
    
    router.get('/', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('GET', 'repobranches'));
        }

        const branches = await getBranches(req.query.data_upload_id);
        res.status(200).json(branches);
    });

    router.get('/:branchId', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.branchId)));
        }
        const branch = await getBranchById(req.params.branchId);
        res.status(200).json(branch);
    });

    router.put('/:branchId', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('PUT', ('repobranches/'+req.params.branchId)));
        }
        let f = {...req.body};
        const result = await updateBranch(req.params.branchId, f.type, f.name, f.description);
        res.status(200).json(result);
    });

    router.delete('/:branchId', auth.requireAdmin, async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('DELETE', ('repobranches/'+req.params.branchId)));
        }
        await deleteBranch(req.params.branchId);
        res.status(200).json({status: "ok"});
    });

    router.post('/:repoId/branches', async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('POST', ('repobranches/'+req.params.repoId+"/branches")));
        }
        let f = {...req.body};
        const repoId = req.params.repoId;

        let error = false;
        if (!f.name){
            error = true;
            error = "Name is required"
        }else if (!f.type){
            error = true;
            error = "Type is required"
        }else if (!f.upload_id){
            error = true;
            error = "Upload id is required";
        }else if (!f.description){
            error = true;
            error = "Description is required";
        }

        if (error){
            return res.status(400).json({error: error});
        }

        const branch = await addBranch(repoId, f.type, f.name, f.description, f.upload_id);
        res.status(201).json({
            id: branch._id.toString()
        });
    });

    router.get('/:repoId/branches', async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.repoId+"/branches")));
        }
        const repoId = req.params.repoId;
        const branches = await listBranches(repoId);
        res.status(200).json(branches);
    });

    router.post('/:branchId/revisions', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('POST', ('repobranches/'+req.params.branchId+"/revisions")));
        }
        let f = {...req.body};
        const branchId = req.params.branchId;
        const branch = await getBranchById(branchId);
        const rev = await revisionService.createRevisionWithDataPackage(branch, f.change_summary, f.updater, f.descriptor)
    
        res.status(201).json({
            id: rev._id.toString()
        });
    });

    router.get('/:branchId/revisions', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.branchId+"/revisions")));
        }
        const branchId = req.params.branchId;
        await getBranchById(branchId);
        const revisions = await revisionService.listRevisionsByBranch(branchId);
        res.status(200).json(revisions);
    });

    router.put('/:branchId/revisions/:revId', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('PUT', ('repobranches/'+req.params.branchId+"/revisions/"+req.params.revId)));
        }
        let f = {...req.body};
        const branchId = req.params.branchId;
        const revId = req.params.revId;
        await getBranchById(branchId);
        const rev = await revisionService.updateRevision(revId, f.changeSummary, f.updater)
    
        res.status(200).json(rev);
    });

    router.delete('/:branchId/revisions/:revId', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase)){
            return res.status(404).send(util.phaseText('DELETE', ('repobranches/'+req.params.branchId+"/revisions/"+req.params.revId)));
        }
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