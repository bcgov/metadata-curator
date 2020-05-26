const { repoBranchService, revisionService } = require('../services')

const postRevision = async (req, res, next) => {
    let f = {...req.body};
    const branchId = req.params.branchId;
    const branch = await repoBranchService.getBranchById(branchId);
    const rev = await revisionService.createRevisionWithDataPackage(branch, f.change_summary, f.updater, f.descriptor)

    res.status(201).json({
        id: rev._id.toString()
    });
}

const putRevision = async (req, res, next) => {
    let f = {...req.body};
    const branchId = req.params.branchId;
    const revId = req.params.revId;
    await repoBranchService.getBranchById(branchId);
    const rev = await revisionService.updateRevision(revId, f.changeSummary, f.updater)

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

    res.status(201).json(rev);
}

const deleteRevision = async (req, res, next) => {
    const branchId = req.params.branchId;
    const revId = req.params.revId;
    await repoBranchService.getBranchById(branchId);
    const rev = await revisionService.deleteRevision(revId)
    res.status(204).json(rev);
}

const getRevisions = async (req, res, next) => {
    const branchId = req.params.branchId;
    await repoBranchService.getBranchById(branchId);
    const revisions = await revisionService.listRevisionsByBranch(branchId);
    res.status(200).json(revisions);
}

module.exports = {
    postRevision,
    getRevisions,
    getRevision,
    putRevision,
    deleteRevision
}
