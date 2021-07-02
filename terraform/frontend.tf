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

  env = var.makeKeycloak ? ["HOSTNAME=mc_backend","NODE_TLS_REJECT_UNAUTHORIZED=0"] : ["HOSTNAME=mc_backend"]
}

data "docker_registry_image" "mc_backend" {
  name = "${var.images["owner"]}/metadata_curator_api${var.images["frontend_bridge"]}"
}

resource "docker_image" "mc_backend" {
  name          = data.docker_registry_image.mc_backend.name
  pull_triggers = [data.docker_registry_image.mc_backend.sha256_digest]
}

data "null_data_source" "oidcConfig" {
  inputs = {
    oidc1 = <<-EOF
"oidc": {
    "issuer": "${var.oidc["issuer"]}",
    "authorizationURL": "${var.oidc["authorizationURL"]}",
    "tokenURL": "${var.oidc["tokenURL"]}",
    "userInfoURL": "${var.oidc["userInfoURL"]}",
    "clientID": "${var.oidc["clientID"]}",
    "clientSecret": "${var.oidc["clientSecret"]}",
    "callbackURL": "${var.host}/api/callback",
    "logoutURL": "${var.oidc["logoutURL"]}?redirect_uri=${var.host}",
    "scope": "openid profile offline_access"
}
EOF

    oidc2 = <<-EOF
"oidc": {
    "issuer": "${var.authHost}/auth/realms/mc",
    "authorizationURL": "${var.authHost}/auth/realms/mc/protocol/openid-connect/auth",
    "tokenURL": "${var.authHost}/auth/realms/mc/protocol/openid-connect/token",
    "userInfoURL": "${var.authHost}/auth/realms/mc/protocol/openid-connect/userinfo",
    "clientID": "outputchecker",
    "clientSecret": "${random_uuid.outputcheckerClientSecret[0].result}",
    "callbackURL": "${var.host}/api/callback",
    "logoutURL": "${var.authHost}/auth/realms/mc/protocol/openid-connect/logout?redirect_uri=${var.host}",
    "scope": "openid profile offline_access"
}
EOF
  }
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
    

    uploadUrl = "\"uploadUrl\": \"${var.host}/files/\"",

    base64EncodedPGPPublicKey = "\"base64EncodedPGPPublicKey\": \"${var.base64EncodedPGPPublicKey}\"",

    approverGroups = "\"approverGroups\": []"

    forumApi = "\"forumApi\": {\"baseUrl\": \"http://mc_forum_api:3000/v1\"}"

    oidc = var.makeKeycloak ? data.null_data_source.oidcConfig.outputs.oidc2 : data.null_data_source.oidcConfig.outputs.oidc1

    logLevel = "\"logLevel\": \"debug\""
    jwtSecret = "\"jwtSecret\": \"${random_string.jwtSecret.result}\""
    jwtAud = "\"jwtAud\": \"aud\""
    orgAttribute = "\"orgAttribute\": \"${var.orgAttribute}\""
    requiredRoleToCreateRequest = "\"requiredRoleToCreateRequest\": \"${var.requiredRoleToCreateRequest}\""
    alwaysNotifyListOnTopicCreate = "\"alwaysNotifyListOnTopicCreate\": ${var.alwaysNotifyListOnTopicCreate}"
    alwaysNotifyUninvolvedOnCommentAdd = "\"alwaysNotifyUninvolvedOnCommentAdd\": ${var.alwaysNotifyUninvolvedOnCommentAdd}"
    approverGroups = "\"approverGroups\": ${jsonencode(var.approverGroups)}"
    alwaysNotifyList = "\"alwaysNotifyList\": ${jsonencode(var.alwaysNotifyList)}"
    email = "\"email\": { \"enabled\":${var.email.enabled}, \"service\": \"${var.email.service}\", \"secure\": ${var.email.secure}, \"port\": ${var.email.port}, \"user\": \"${var.email.user}\", \"pass\": \"${var.email.pass}\", \"from\": \"${var.email.from}\", \"subject\": \"${var.email.subject}\"}"
    adminGroup = "\"adminGroup\": \"${var.adminGroup}\""
    formio = "\"formio\": ${jsonencode(var.formio)}"
  }
  depends_on = [data.null_data_source.oidcConfig]
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
  ${data.null_data_source.feIndConfig.outputs["base64EncodedPGPPublicKey"]},
  ${data.null_data_source.feIndConfig.outputs["approverGroups"]},
  ${data.null_data_source.feIndConfig.outputs["forumApi"]},

  ${data.null_data_source.feIndConfig.outputs["logLevel"]},
  ${data.null_data_source.feIndConfig.outputs["jwtSecret"]},
  ${data.null_data_source.feIndConfig.outputs["jwtAud"]},
  ${data.null_data_source.feIndConfig.outputs["orgAttribute"]},
  ${data.null_data_source.feIndConfig.outputs["requiredRoleToCreateRequest"]},
  ${data.null_data_source.feIndConfig.outputs["alwaysNotifyListOnTopicCreate"]},
  ${data.null_data_source.feIndConfig.outputs["alwaysNotifyUninvolvedOnCommentAdd"]},
  ${data.null_data_source.feIndConfig.outputs["alwaysNotifyList"]},
  ${data.null_data_source.feIndConfig.outputs["email"]},
  ${data.null_data_source.feIndConfig.outputs["adminGroup"]},
  ${data.null_data_source.feIndConfig.outputs["formio"]}

}
EOF

  }
}

resource "null_resource" "get_nginx_ip" {
  depends_on = [docker_container.mc_nginx]
  provisioner "local-exec" {
    command = "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mc_nginx > ${var.hostRootPath}/nginx_ip && truncate -s -1 ${var.hostRootPath}/nginx_ip && chmod 777 ${var.hostRootPath}/nginx_ip"
  }
}

data "local_file" "nginx_ip" {
    filename = "${var.hostRootPath}/nginx_ip"
    depends_on = [
      null_resource.get_nginx_ip
    ]
}

resource "docker_container" "mc_backend" {
  image   = docker_image.mc_backend.latest
  name    = "mc_backend"
  restart = "on-failure"
  networks_advanced {
    name = docker_network.private_network.name
  }

  host {
    host = var.authHostname
    ip   = data.local_file.nginx_ip.content
  }

  depends_on = [
    data.local_file.nginx_ip,
    null_resource.get_nginx_ip
  ]

  env = var.makeKeycloak ? ["NODE_CONFIG=${replace(data.null_data_source.configValues.outputs["nodeConfig"], "\n", "")}", "NODE_TLS_REJECT_UNAUTHORIZED=0"] : ["NODE_CONFIG=${replace(data.null_data_source.configValues.outputs["nodeConfig"], "\n", "")}"]
}