const { repoService, repoBranchService, revisionService } = require('../services')

const getRepos = async (req, res, next) => {
    let repos = await repoService.listRepositories(req.user, req.query);
    res.status(200).json(repos);
}

const postRepository = async (req, res, next) => {
    let fields = {...req.body};

    const repo = await repoService.createRepo(req.user, fields.name);
    res.status(201).json({id: repo._id.toString()});
}

const putRepository = async (req, res, next) => {
    const repo = await repoService.updaterepo(req.user, req.params.repoId, req.body);
    res.status(200).json(dataUpload);
}

const postBranch = async (req, res, next) => {
    let f = {...req.body};
    const repoId = req.params.repoId;
    const branch = await repoBranchService.addBranch(repoId, f.type, f.name, f.description, f.upload_id);
    res.status(201).json({
        id: branch._id.toString()
    });
}

const putBranch = async (req, res, next) => {
    let f = {...req.body};
    const repoId = req.params.repoId;

    const branch = await repoBranchService.updateBranch(repoId, f.type, f.name, f.description, f.upload_id);
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
    postRepository,
    putRepository,
    postBranch,
    getBranches
}
