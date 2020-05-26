const { repoBranchService, revisionService } = require('../services')


const getBranch = async (req, res, next) => {
    const branch = await repoBranchService.getBranchById(req.params.branchId);
    res.status(200).json(branch);
}

const deleteBranch = async (req, res, next) => {
    await repoBranchService.deleteBranch(req.params.branchId);
    res.status(204).send();
}

const putBranch = async (req, res, next) => {
    let f = {...req.body};
    const result = await repoBranchService.updateBranch(req.params.branchId, f.type, f.name, f.description);
    res.status(200).json(result);
}

const postRevision = async (req, res, next) => {
    let f = {...req.body};
    const branchId = req.params.branchId;
    const branch = await repoBranchService.getBranchById(branchId);
    const rev = await revisionService.createRevisionWithDataPackage(branch, f.change_summary, f.updater, f.descriptor)

    res.status(201).json({
        id: rev._id.toString()
    });
}

const getRevision = async (req, res, next) => {
    const branchId = req.params.branchId;
    const revId = req.params.revId;
    await repoBranchService.getBranchById(branchId);
    const rev = await revisionService.getRevisionById(revId)
    if (rev.repo_branch_id.toString() !== branchId) {
        throw new Error("Invalid revision for branch")
    }

    res.status(200).json(rev);
}

const putRevision = async (req, res, next) => {
    let f = {...req.body};
    const branchId = req.params.branchId;
    const revId = req.params.revId;
    await repoBranchService.getBranchById(branchId);
    const rev = await revisionService.updateRevision(revId, f.changeSummary, f.updater)

    res.status(200).json(rev);
}

const deleteRevision = async (req, res, next) => {
    const branchId = req.params.branchId;
    const revId = req.params.revId;
    await repoBranchService.getBranchById(branchId);
    await revisionService.deleteRevision(revId)
    res.status(204).send();
}

const getRevisions = async (req, res, next) => {
    const branchId = req.params.branchId;
    await repoBranchService.getBranchById(branchId);
    const revisions = await revisionService.listRevisionsByBranch(branchId);
    res.status(200).json(revisions);
}

module.exports = {
    getBranch,
    deleteBranch,
    putBranch,
    postRevision,
    getRevisions,
    getRevision,
    putRevision,
    deleteRevision
}
