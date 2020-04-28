let db = require('../db/db');
const { Seeder } = require('mongoose-data-seed');

const data = [
  {
    _id: "5e7a5a4cd753d25b044b3d67",
    create_date: new Date(),
    repo_id: "5e7a48acd49496d387315b13",
    type: "standard",
    name: "edition/standard",
    description: "Dataset 1 - Upload 1 repo branch",
    revisions: []
  },
  {
    _id: "5e7a5a4dd753d25b044b3d68",
    create_date: new Date(),
    repo_id: "5e7a4908d49496d387315b14",
    type: "standard",
    name: "edition/standard",
    description: "Dataset 1 - Upload 2 repo branch",
    revisions: []
  },
  {
    _id: "5e7a5a4dd753d25b044b3d69",
    create_date: new Date(),
    repo_id: "5e7a4926d49496d387315b15",
    type: "standard",
    name: "edition/standard",
    description: "Dataset 2 - Upload 1 repo branch",
    revisions: []
  }

];

class RepoBranchesSeeder extends Seeder {

  async shouldRun() {
    const repoBranchSchema = db.RepoBranchSchema
    const count = await repoBranchSchema.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const repoBranchSchema = db.RepoBranchSchema;
    return repoBranchSchema.create(data);
  }

}

module.exports = {RepoBranchesSeeder, RepoBranchesData:data};
