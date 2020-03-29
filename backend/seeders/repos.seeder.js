let db = require('../db/db');
const { Seeder } = require('mongoose-data-seed');

const data = [
  {
    _id: "5e7a48acd49496d387315b13",
    data_upload_id: "5e7a45e510abf3bbf5068f6f",
    name: "Dataset 1 - Upload 1 repo",
    create_date: new Date()
  },
  {
    _id: "5e7a4908d49496d387315b14",
    data_upload_id: "5e7a45e510abf3bbf5068f72",
    name: "Dataset 1 - Upload 2 repo",
    create_date: new Date()
  },
  {
    _id: "5e7a4926d49496d387315b15",
    data_upload_id: "5e7a45e510abf3bbf5068f74",
    name: "Dataset 2 - Upload 1 repo",
    create_date: new Date()
  }
];

class ReposSeeder extends Seeder {

  async shouldRun() {
    const repoSchema = db.RepoSchema;
    const count = await repoSchema.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const repoSchema = db.RepoSchema;
    return repoSchema.create(data);
  }

}

module.exports = ReposSeeder;
