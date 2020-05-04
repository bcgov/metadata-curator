# Metadata Curator &middot; [![Build Status](https://travis-ci.org/bcgov/metadata-curator.svg?branch=master)](https://travis-ci.org/bcgov/metadata-curator) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Metadata Curator is an application for the encrypted (client side) upload of files to another server, that bundles JSON Table schema with the data able to help by infering information about the data.

## Table of Contents

- [Metadata Curator &middot; ![Build Status](https://travis-ci.org/bcgov/metadata-curator.svg?branch=master) ![License](https://opensource.org/licenses/Apache-2.0)](#metadata-curator-middot-build-statushttpstravis-ciorgbcgov/metadata-curator-licensehttpsopensourceorglicensesapache-20)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Operating System](#operating-system)
  - [Components](#components)
    - [Forum API](#forum-api)
    - [Formio](#policy-api)
    - [Storage API](#storage-api)
    - [Front End](#front-end)
    - [Bridge/Api](#bridge/api)
  - [Terraform](#terraform)
  - [Helm](#helm)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)
  - [Notes](#notes)
    - [Default Port List](#default-port-list)

## Installation

OCWA is written in both node.js and vuejs. Docker is also strongly recommended for Windows platforms. For each of the components, refer to their associated README files for specific instructions.

### Prerequisites

- npm 6.13.7 or newer
- node 10.15.1 LTS or newer
- MongoDB 4.0 or newer
- Docker 18.09.1 or newer
- Minio (Storage API)
- Tusd (Storage API)

### Operating System

Metadata Curator was fully developed on Mac using baremetal, developed with a combo of bare metal and docker on windows (docker for the python apis) and has been deployed on Linux using Terraform, and Kubernetes using Helm.

## Components

### Forum API

- [README](https://github.com/bcgov/forum-api/blob/master/README.md)

The forum API is a nodejs api providing topics (with subtopics), comments and permissions for them. Api docs are available using the OpenApi v3 specification
by running the API and visiting /v1/api-docs. The Forum API also provides a websocket interface for being notified when new topics/comments are created
that are relevant to the user.

### Formio

- [README](https://github.com/formio/formio/blob/master/README.md)

Formio is a tool that provides custom forms with validation, it is used as a library on the frontend for rendering and as an api as well.

### Storage API

- [README](https://github.com/bcgov/OCWA/blob/master/microservices/storageApi/README.md)

The storage API is from OCWA and is a combination of open source existing products. Minio is used to treat any underlying storage as though it was S3 so that only one
backend needs to be supported even if the backend is GCP/Azure/Local Disk or actually S3. TUSD is used to support large file uploads so that they can be resumed
if interrupted due to a connection drop or whatever reason.

### Front End

- [README](/frontend/README.md)

The front end is written using Vuejs. It uses the backend bridge to access the apis.

### Bridge/Api

- [README](/backend/README.md)

The bridge/backend/api is written in NodeJS. It accesses the apis

## Terraform

Terraform scripts are provided for setup on a machine they have been tested on mac and linux. To start you need to create a copy of `terraform.tfvars.example` and call it `terraform.tfvars` change the values in that file so that they make sense for your instance. After running the `terraform apply` command you must create a hosts entry for the domain you specified in terraform.tfvars default from .example is `mc.example.demo`

## Helm

There is a helm chart available at [helm-charts](https://github.com/bcgov/helm-charts/blob/master/metadata-curator)

## Contributing

You must pass the Travis CI builds to be able to submit a pull request that can be accepted.

## [Code of Conduct](/CODE_OF_CONDUCT.md)

Please have a read through our [Code of Conduct](/CODE_OF_CONDUCT.md) that we expect all project participants to adhere to. It will explain what actions will and will not be tolerated.

## License

Metadata-curator is [Apache 2.0 licensed](/LICENSE).

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

After ensuring the [prerequisite libraries](#prerequisites) are installed and cloning this repo follow the below steps to get the program up and running

1. Configure the backend by copying the `default.json.example` file in the `/config` folders,  renaming to `default.json` and modifying or adding their values where appropriate. For the storage API you will need sign into Minio's web interface at `http://localhost:9000` and create a new bucket matching the storage config options defined in the backends `default.json`.

2. Modify `startStorags.sh` to have the storage api information you setup

3. Run the `startStorage.sh` script in this directory `$ ./startAll.py`

4. Start the backend `cd backend; npm run serve`

5. Start the frontend `cd frontend; npm run serve`