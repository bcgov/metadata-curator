data "docker_registry_image" "formio" {
  name = var.images["formio"]
}

data "null_data_source" "indConfig" {
  inputs = {
    mongoConfig = "\"mongo\": \"mongodb://${var.mongodb["username"]}:${random_string.mongoSuperPassword.result}@mc_mongodb:27017/formioapp\""
    jwtConfig = "\"jwt\": { \"secret\": \"${random_string.jwtSecret.result}\"}"
  }
}

data "null_data_source" "values" {
  inputs = {
    nodeConfig = <<-EOF
{
  ${data.null_data_source.indConfig.outputs["mongoConfig"]},
  ${data.null_data_source.indConfig.outputs["jwtConfig"]},
  "host": "${var.hostname}",
  "domain": "${var.host}/formio"
}
EOF

  }
}

resource "docker_image" "formio" {
  name          = data.docker_registry_image.formio.name
  pull_triggers = [data.docker_registry_image.formio.sha256_digest]
}

resource "docker_container" "formio" {
  image   = docker_image.formio.latest
  name    = "mc_formio"
  restart = "on-failure"
  networks_advanced {
    name = docker_network.private_network.name
  }
  ports {
    internal = 3001
    external = 3006
  }
  env = [
    "NODE_CONFIG=${replace(data.null_data_source.values.outputs["nodeConfig"], "\n", "")}",
    "DEBUG=formio:*",
    "MONGO=mongodb://${var.mongodb["username"]}:${random_string.mongoSuperPassword.result}@mc_mongodb:27017/formioapp",
    "ROOT_EMAIL=admin@ocwa.local",
    "ROOT_PASSWORD=${random_string.formioSuperPassword.result}",
  ]

  depends_on = [docker_container.mc_mongodb]
}

resource "null_resource" "mongodb_formio_first_Time_install" {
  provisioner "local-exec" {
    command = "docker exec mc_formio wget https://codeload.github.com/formio/formio-app-formio/zip/master -O client.zip"
  }
  depends_on = [docker_container.formio]
}