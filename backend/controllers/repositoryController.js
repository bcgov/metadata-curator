const { repoService, repoBranchService, revisionService } = require('../services')

const getRepos = async (req, res, next) => {
    let repos = await repoService.listRepositories(req.user, req.query);
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

const getBranches = async (req, res, next) => {
    const repoId = req.params.repoId;
    const branches = await repoBranchService.listBranches(repoId);
    res.status(200).json(branches);
}

module.exports = {
    getRepos,
    postBranch,
    getBranches
}
