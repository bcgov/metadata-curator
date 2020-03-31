let db = require('../db/db');
const { Seeder } = require('mongoose-data-seed');

const data = [
  {
    _id: "5e7a45e510abf3bbf5068f6f",
    name: "Dataset 1 - Upload 1",
    description: "Upload for dataset 1",
    uploader: "jane doe",
    create_date: new Date(2020, 0, 1),
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
    topic_id: "5e84fc97e4496e2f5390bab4"
    // comments: [
    //   {
    //     create_date: new Date(),
    //     content: "missing data.  where is the remaining data?",
    //     commenter: "john doe"
    //   },
    //   {
    //     create_date: new Date(),
    //     content: "sorry, forgot some of the data",
    //     commenter: "jane doe"
    //   },
    //   {
    //     create_date: new Date(),
    //     content: "can you do another data upload that contains all the data?",
    //     commenter: "john doe"
    //   },
    //   {
    //     create_date: new Date(),
    //     content: "yes, will do another upload at the end of the week.",
    //     commenter: "jane doe"
    //   },
    // ]
  },
  {
    _id: "5e7a45e510abf3bbf5068f72",
    name: "Dataset 1 - Upload 2",
    description: "Upload for dataset 1",
    uploader: "john doe",
    create_date: new Date(2020, 0, 5),
    files: [
      {
        name: "filename3.csv",
        size: 1000
      }
    ],
    // comments: [
    //   {
    //     create_date: new Date(),
    //     content: "missing data.  where is the remaining data",
    //     commenter: "john doe"
    //   },
    //   {
    //     create_date: new Date(),
    //     content: "sorry, forgot the data",
    //     commenter: "jane doe"
    //   }
    // ]
  },    
  {
    _id: "5e7a45e510abf3bbf5068f74",
    name: "Dataset 2 - Upload 1",
    description: "Upload for dataset 2",
    uploader: "jane doe",
    create_date: new Date(2020, 1, 3),
    files: [
      {
        name: "filename1.csv",
        size: 1000
      }
    ],
    // comments: [
    //   {
    //     create_date: new Date(),
    //     content: "missing data.  where is the remaining data",
    //     commenter: "john doe"
    //   },
    //   {
    //     create_date: new Date(),
    //     content: "sorry, forgot the data",
    //     commenter: "jane doe"
    //   }
    // ]
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

module.exports = DataUploadsSeeder;
