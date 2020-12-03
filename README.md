# Metadata Curator &middot; [![Build Status](https://travis-ci.org/bcgov/metadata-curator.svg?branch=master)](https://travis-ci.org/bcgov/metadata-curator) [![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=mdc_backend&metric=alert_status)](https://sonarcloud.io/dashboard?id=mdc_backend) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=mdc_backend&metric=coverage)](https://sonarcloud.io/dashboard?id=mdc_backend) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Metadata Curator is an application for the encrypted (client side) upload of files to another server, that bundles JSON Table schema with the data able to help by infering information about the data.

## Table of Contents

- Metadata Curator
  - [Table of Contents](#table-of-contents)
  - [Installation](#1-installation-bare-metal)
    - [Prerequisites](#prerequisites)
    - [Operating System](#operating-system)
  - [Components](#components)
    - [Forum API](#forum-api)
    - [Formio](#policy-api)
    - [Storage API](#storage-api)
    - [Bridge/Api](#bridge/api)
    - [Front End](#front-end)
  - [Notes](#notes)
    - [Default Port List](#default-port-list)
  - [Developer Quick Start Guide](#developer-quick-start-guide)
  - [Terraform](#2-terraform-installation)
  - [Helm](#helm)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)


## 1. Installation (Bare Metal)

Metadata Curator is written in both node.js and vuejs. Docker is also strongly recommended for Windows platforms. For each of the components, refer to their associated README files for specific instructions.

### Prerequisites

- npm 6.13.7 or newer `npm --version`
- node 10.15.1 LTS or newer; `node --version`
- MongoDB 4.0 or newer; `mongo --version`
- Docker 18.09.1 or newer; `docker --version`
- Minio (Storage API); `minio --version`
- Tusd (Storage API); `tusd --version`
- (optional) Terraform version 12 `terraform --version`

**Local Development macOS < 10.15** (as of 2020/11/24)
- xcode [reference](https://github.com/nodejs/node-gyp/blob/master/macOS_Catalina.md#i-did-all-that-and-the-acid-test-still-does-not-pass--)
    - run the following to test whether your system needs to reinstall xcode: `curl -sL https://github.com/nodejs/node-gyp/raw/master/macOS_Catalina_acid_test.sh | bash`

### Operating System

Metadata Curator was fully developed on Mac using baremetal, developed with a combo of bare metal and docker on windows (docker for the python apis) and has been deployed on Linux using Terraform, and Kubernetes using Helm.

## Components

### 1. Forum API (comment functionality)
#### NodeJS, MongoDB

- [Forum API README](https://github.com/bcgov/forum-api/blob/master/README.md)

_Description:_
The forum API is a nodejs api providing topics (with subtopics), comments and permissions for them. Api docs are available using the OpenApi v3 specification by running the API and visiting /v1/api-docs. The Forum API also provides a websocket interface for being notified when new topics/comments are created that are relevant to the user.

_Quick Start:_
```
## install outside of metadata-curator directory
cd ../
git clone git@github.com:bcgov/forum-api.git
cd forum-api

## mongoDB
mongo
db.createCollection("commentApi")
use commentApi
db.createUser({user:"commentApi", pwd:"commentApi", roles:["dbAdmin", "readWrite"]}) 
exit

## forumApi
cp config/default.json.example config/default.json
npm install
npm run serve
```
**Test (Forum API)**
Visit the following on your local machine to test a successful installation [http://localhost:3000/v1/api-docs](http://localhost:3000/v1/api-docs)

### 2. Formio (forms)
#### Third Party API Platform
- [Formio README](https://github.com/formio/formio/blob/master/README.md)

_Description:_
Formio is a tool that provides custom forms with validation, it is used as a library on the frontend for rendering and as an api as well.

_Quick Start:_
The terraform script contains all the necessary configurations and data that is needed to serve forms. Depending on development need, the quickest way may be to use terraform to build all containers, then shut them down with the exception of the container with the NAME `mc_formio`.
```
# start terraform scripts
cd terraform
terraform init
terraform plan -var hostRootPath=`pwd`/_tmp
terraform apply -var hostRootPath=`pwd`/_tmp -auto-approve

# after a succesful build, stop all containers, with the exception of mc_formio
docker stop mc_ngnix mc_forum_api mc_backend mc_minio mc_frontend mc_tusd mc_mongodb

# confirm that only mc_formio is running
docker ps 
```

### 3. Storage API (file upload protocol, object storage)
#### Minio, Tusd
- [Storage API README](https://github.com/bcgov/OCWA/blob/master/microservices/storageApi/README.md)

_Description:_
The storage API is from OCWA and is a combination of open source existing products. Minio is used to treat any underlying storage as though it was S3 so that only one backend needs to be supported even if the backend is GCP/Azure/Local Disk or actually S3. TUSD is used to support large file uploads so that they can be resumed if interrupted due to a connection drop or whatever reason.

_Quick Start:_

**Note:** Values entered in `/metadata-curator/backend/config/default.json` must be consistent with values in `.startStorage.sh`
```
cd metadata-curator
./startStorage.sh
```
### 4. Bridge/Api
#### NodeJS app
- [Bridge README](/backend/README.md)

_Description:_
The bridge/backend/api is written in NodeJS. It accesses the apis

_Quick Start:_
```
cd backend
npm install
npm run serve
```
### 5. Front End
#### Vue.js 
- [Front End README](/frontend/README.md)

_Description:_
The front end is written using Vue.js. It uses the backend bridge to access the apis.

_Quick Start:_
```
cd frontend
npm install
npm run serve
```

## Notes

### Default Port List

| **Endpoint**        | **Port** |
| ------------------- | -------- |
| Forum WS            | 2999     |
| Forum WS (Nginx)    | 3001     |
| Forum Api           | 3000     |
| Formio              | 3001     | (recommend changing)
| Storage Api (Minio) | 9000     |
| Storage Api (Tusd)  | 1080     |
| Front End           | 8080     |
| Back End / Bridge   | 9090     |

### Developer Quick Start Guide

After ensuring the [prerequisite libraries](#prerequisites) are installed and cloning this repo follow the below steps to get the program up and running:

1. Configure the backend by copying the `default.json.example` file in the `/config` folders,  renaming to `default.json` and modifying or adding their values where appropriate. 

2. Ensure an instance of ForumAPI is running outside of the metadata-curator directory/installation. 

3. Ensure an instance of Formio is running outside of the metadata-curator directory/installation. 

4. Modify `startStorage.sh` to have the storage api information you setup. 

5. Run the `startStorage.sh` script in this directory `$ ./startStorage.sh`. Components are Minio and Tusd.

6. Ensure that your Minio instance is working and create a new bucket by going to [http://localhost:9000](http://localhost:9000) - Using the web interface, enter the values stored as `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` in `startStorage.sh`. After authentication, use the GUI to create a bucket called 'files', for example. Ensure that the bucket name created matches the directory name in `"uploadUrl": "http://localhost:1080/files"` defined in `backend/config/default.json`.

7. Start the backend `cd backend; npm install; npm run serve`

8. Start the frontend `cd frontend; npm install; npm run serve`

9. Go to [http://localhost:8080](http://localhost:8080)

## 2. Terraform Installation

Terraform scripts are provided for setup on a machine they have been tested on mac and linux. To start you need to: 
##### 1. Create a copy of `terraform.tfvars.example` and call it `terraform.tfvars` 
    - `cp terraform/terraform.tvars.example terraform/terraform.tvars`
##### 2. Change the values in that file so that they make sense for your instance. 
##### 3. If this is the first time running the terraform, run `terraform init`
##### 4. Run the following
```
terraform plan -var hostRootPath=`pwd`/_tmp`
terraform apply
```
##### 5. After running the `terraform apply` command you must create a hosts entry in `/etc/hosts` for the domain you specify in terraform.tfvars. Default value is `mc.example.demo`

More detailed descriptions exist in [Terraform README](/terraform/README.md) 

## Helm

There is a helm chart available at [helm-charts](https://github.com/bcgov/helm-charts/blob/master/metadata-curator)

## Contributing

You must pass the Travis CI builds to be able to submit a pull request that can be accepted.

## [Code of Conduct](/CODE_OF_CONDUCT.md)

Please have a read through our [Code of Conduct](/CODE_OF_CONDUCT.md) that we expect all project participants to adhere to. It will explain what actions will and will not be tolerated.

## License

Metadata-curator is [Apache 2.0 licensed](/LICENSE).

    Copyright 2020 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at 

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
