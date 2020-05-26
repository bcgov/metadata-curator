const {repositoryController} = require('../../../controllers')
const { getRepos, getBranches, postBranch } = repositoryController;

module.exports = (router) => {
    router.get('/', catchAsync(getRepos));
    router.post('/:repoId/branches', catchAsync(postBranch));
    router.get('/:repoId/branches', catchAsync(getBranches));
    return router;
}
