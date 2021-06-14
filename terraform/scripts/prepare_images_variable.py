import os
from string import Template

template = """ 

images = {
    owner = "quay.io/h3brandon"
    forum_api = ":${TAG}"
    formio = "h3brandon/formio:latest"
    frontend = ":${TAG}"
    tusd = ":68385adc0cba"
    minio = ":RELEASE.2019-04-23T23-50-36Z"
    frontend_bridge = ":${TAG}"    
}
    """

s = Template(template)

with open('terraform.auto.tfvars', 'w') as the_file:
    the_file.write(s.substitute(TAG=os.environ['BRANCH'].replace('/', '-')))

template2 = """ 

provider "docker" {
  host = "tcp://localhost:2376"

  registry_auth {
    address  = "quay.io:8181"
    username = "${USER}"
    password = "${PASS}"
  }
}
    """

creds = Template(template2)

with open('docker.tf', 'w') as file2:
    file2.write(creds.substitute(USER=os.environ['QUAYIO_USERNAME'], PASS=os.environ['QUAYIO_PASSWORD']))