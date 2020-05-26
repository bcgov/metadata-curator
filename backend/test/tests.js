process.env.NODE_ENV = 'test';

describe("MC Unit Tests", function() {
    require('./modules/authTest');
    require('./modules/semantic_infer');
    require('./modules/resourceDiffTest');
    require('./clients/forumClientTest');
    require('./clients/formioClientTest');
    require('./notifications/emailTest');
    require('./services/dataUploadServiceTest');
    require('./services/commentServiceTest');
    require('./services/tableSchemaServiceTest');
    require('./services/dataPackageServiceTest');
    require('./services/repoServiceTest');
    require('./services/repoBranchServiceTest');
    require('./services/revisionServiceTest');
    require('./controllers/dataUploadControllerTest');
    require('./controllers/repoBranchControllerTest');
    require('./controllers/repoControllerTest');
    require('./v1/forumApiTest');
    require('./v1/formioTest');
});
