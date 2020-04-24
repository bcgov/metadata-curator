data "docker_registry_image" "mc_frontend" {
  name = "${var.images["owner"]}/metadata_curator_ui${var.images["frontend"]}"
}

resource "docker_image" "mc_frontend" {
  name          = data.docker_registry_image.mc_frontend.name
  pull_triggers = [data.docker_registry_image.mc_frontend.sha256_digest]
}

resource "docker_container" "mc_frontend" {
  image   = docker_image.mc_frontend.latest
  name    = "mc_frontend"
  restart = "on-failure"
  networks_advanced {
    name = docker_network.private_network.name
  }

  env = [
    "HOSTNAME=mc_backend",
  ]
}

data "docker_registry_image" "mc_backend" {
  name = "${var.images["owner"]}/metadata_curator_api${var.images["frontend_bridge"]}"
}

resource "docker_image" "mc_backend" {
  name          = data.docker_registry_image.mc_backend.name
  pull_triggers = [data.docker_registry_image.mc_backend.sha256_digest]
}

data "null_data_source" "feIndConfig" {
  inputs = {
    database =  <<-EOF
"database": {
  "host": "mc_mongodb:27017", 
  "username": "${var.mongodb["username"]}",
  "password": "${random_string.mongoSuperPassword.result}",
  "dbName": "oc_db"
}
EOF

    sessionSecret =  "\"sessionSecret\": \"${random_string.jwtSecret.result}\""
    frontend = "\"frontend\": \"${var.host}\""
    oidc = <<-EOF
"oidc": {
    "issuer": "${var.oidc["issuer"]}",
    "authorizationURL": "${var.oidc["authorizationURL"]}",
    "tokenURL": "${var.oidc["tokenURL"]}",
    "userInfoURL": "${var.oidc["userInfoURL"]}",
    "clientID": "${var.oidc["clientID"]}",
    "clientSecret": "${var.oidc["clientSecret"]}",
    "callbackURL": "${var.host}/api/callback",
    "scope": "openid profile offline_access"
}
EOF

    uploadUrl = "\"uploadUrl\": \"http://mc_tusd:1080/files\"",

    base64EncodedPGPPublicKey = "\"base64EncodedPGPPublicKey\": \"${var.base64EncodedPGPPublicKey}\""
  }
}

data "null_data_source" "configValues" {
  inputs = {
    nodeConfig = <<-EOF
{ 
  ${data.null_data_source.feIndConfig.outputs["database"]},
  ${data.null_data_source.feIndConfig.outputs["sessionSecret"]},
  ${data.null_data_source.feIndConfig.outputs["frontend"]},
  ${data.null_data_source.feIndConfig.outputs["oidc"]},
  ${data.null_data_source.feIndConfig.outputs["uploadUrl"]},
  ${data.null_data_source.feIndConfig.outputs["base64EncodedPGPPublicKey"]}
}
EOF

  }
}

resource "docker_container" "mc_backend" {
  image   = docker_image.mc_backend.latest
  name    = "mc_backend"
  restart = "on-failure"
  networks_advanced {
    name = docker_network.private_network.name
  }

  env = [
    "NODE_CONFIG=${replace(data.null_data_source.configValues.outputs["nodeConfig"], "\n", "")}",
  ]
}