const { repoService, repoBranchService, revisionService } = require('../services')

const getRepos = async (req, res, next) => {
    let repos = await repoService.listRepositories();
    res.status(200).json(repos);
}

const postBranch = async (req, res, next) => {
    let f = {...req.body};
    const repoId = req.params.repoId;
    const branch = await repoBranchService.addBranch(repoId, f.type, f.name, f.description);
    res.status(201).json({
        id: branch._id.toString()
    });
}

const getBranch = async (req, res, next) => {
    const branch = await repoBranchService.getBranchById(req.params.branchId);
    if (branch.repo_id.toString() != req.params.repoId) {
        throw new Error("Invalid branch for repository")
    }
    res.status(200).json(branch);
}

const deleteBranch = async (req, res, next) => {
    const branch = await repoBranchService.deleteBranch(req.params.branchId);
    res.status(204).json(branch);
}

const putBranch = async (req, res, next) => {
    let f = {...req.body};
    const result = await repoBranchService.updateBranch(req.params.branchId, f.type, f.name, f.description);
    res.status(200).json(result);
}

const getBranches = async (req, res, next) => {
    const repoId = req.params.repoId;
    const branches = await repoBranchService.listBranches(repoId);
    res.status(200).json(branches);
}

module.exports = {
    getRepos,
    postBranch,
    getBranches,
    getBranch,
    putBranch,
    deleteBranch
}
