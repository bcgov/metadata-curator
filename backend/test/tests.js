process.env.NODE_ENV = 'test';

describe("MC Unit Tests", function() {
    require('./modules/semantic_infer');
    require('./v1/dataUploads');
});
