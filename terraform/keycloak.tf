resource "random_string" "keycloakAdminPassword" {
  length           = 16
  special          = false
  override_special = "/@\" "
  count = var.makeKeycloak ? 1 : 0
}

resource "random_string" "testUserPassword" {
  length           = 16
  special          = false
  override_special = "/@\" "
  count = var.makeKeycloak ? 1 : 0
}

resource "random_uuid" "outputcheckerClientSecret" {
    count = var.makeKeycloak ? 1 : 0
}

data "docker_registry_image" "keycloak" {
  name = "jboss/keycloak:4.8.3.Final"
  count = var.makeKeycloak ? 1 : 0
}

resource "docker_image" "keycloak" {
  name          = data.docker_registry_image.keycloak[0].name
  pull_triggers = [data.docker_registry_image.keycloak[0].sha256_digest]
  keep_locally  = true
  count = var.makeKeycloak ? 1 : 0
}

resource "docker_container" "mc_keycloak" {
  image   = docker_image.keycloak[0].latest
  name    = "mc_keycloak"
  restart = "on-failure"
  networks_advanced {
    name = docker_network.private_network.name
  }
  env = [
    "DB_VENDOR=postgres",
    "DB_ADDR=mc_postgres",
    "DB_PORT=5432",
    "DB_USER=${var.postgres["username"]}",
    "DB_PASSWORD=${random_string.postgresAppPassword[0].result}",
    "DB_DATABASE=keycloak",
    "PROXY_ADDRESS_FORWARDING=true",
    "KEYCLOAK_USER=${var.keycloak["username"]}",
    "KEYCLOAK_PASSWORD=${random_string.keycloakAdminPassword[0].result}",
  ]
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://mc_keycloak:8080"]
    interval     = "5s"
    timeout      = "5s"
    start_period = "10s"
    retries      = 20
  }
  depends_on = [null_resource.postgres_first_time_install[0]]
  count = var.makeKeycloak ? 1 : 0
}

resource "null_resource" "keycloak_first_time_install" {
  provisioner "local-exec" {
    command = "scripts/wait-for-healthy.sh mc_keycloak"
  }

  provisioner "local-exec" {
    environment = {
      "TESTUSER_PASSWORD"      = random_string.testUserPassword[0].result
      "KEYCLOAK_USER"          = var.keycloak["username"]
      "KEYCLOAK_PASSWORD"      = random_string.keycloakAdminPassword[0].result
      "KEYCLOAK_CLIENT_SECRET" = random_uuid.outputcheckerClientSecret[0].result
      "ORG_ATT"                = var.orgAttribute
      "REQUIRED_CREATE_ROLE"   = var.requiredRoleToCreateRequest
      "APPROVER_0"             = var.approverGroups[0]
      "APPROVER_1"             = var.approverGroups[1]
      "BUSCAT_0"               = var.businessCategories[0]
      "BUSCAT_1"               = var.businessCategories[1]
    }
    command = "docker run --net=mc_vnet -e TESTUSER_PASSWORD -e KEYCLOAK_USER -e KEYCLOAK_PASSWORD -e KEYCLOAK_CLIENT_SECRET -v \"$PWD:/work\" --entrypoint /bin/bash jboss/keycloak:4.1.0.Final -c /work/scripts/keycloak-setup.sh"
  }

  depends_on = [docker_container.mc_keycloak]
  count = var.makeKeycloak ? 1 : 0
}
