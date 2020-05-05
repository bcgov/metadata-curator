let db = require('../db/db');
const { Seeder } = require('mongoose-data-seed');

const data = [
  {
    _id: "5e7a45e510abf3bbf5068f6f",
    name: "Upload 1",
    description: "Upload 1",
    uploader: "Data Provider_1",
    create_date: new Date(2020, 0, 1),
    opened_by_approver: false,
    approver_has_commented: false,
    files: [
      {
        name: "filename1.csv",
        size: 1000
      },
      {
        name: "filename2.csv",
        size: 2000
      }
    ],
  },
  {
    _id: "5e7a45e510abf3bbf5068f72",
    name: "Upload 2",
    description: "Upload 2",
    uploader: "Data Provider_1",
    create_date: new Date(2020, 0, 5),
    opened_by_approver: false,
    approver_has_commented: false,
    files: [
      {
        name: "filename3.csv",
        size: 1000
      }
    ],
  },    
  {
    _id: "5e7a45e510abf3bbf5068f74",
    name: "Upload 3",
    description: "Upload 3",
    uploader: "Data Provider_1",
    create_date: new Date(2020, 1, 3),
    opened_by_approver: false,
    approver_has_commented: false,
    files: [
      {
        name: "filename1.csv",
        size: 1000
      }
    ],
  }  
];

class DataUploadsSeeder extends Seeder {

  async shouldRun() {
    const dataUploadSchema = db.DataUploadSchema;
    const count = await dataUploadSchema.countDocuments().exec();
    // console.log("DataUploadsSeeder dataUploadSchema.countDocuments(): " + count);

    return count === 0;
  }

  async run() {
    const dataUploadSchema = db.DataUploadSchema;
    return dataUploadSchema.create(data);
  }
}

module.exports = {DataUploadsSeeder, DataUploadData: data};
