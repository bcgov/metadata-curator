import os
from string import Template

template = """ 

images = {
    owner = "quay.io/h3brandon"
    forum_api = "bcgovimages/ocwa_forum_api:latest"
    frontend = ":${TAG}"
    tusd = ":68385adc0cba"
    minio = ":RELEASE.2019-04-23T23-50-36Z"
    frontend_bridge = ":${TAG}"    
}
    """

s = Template(template)

with open('terraform.auto.tfvars', 'w') as the_file:
    the_file.write(s.substitute(TAG=os.environ['BRANCH'].replace('/', '-')))