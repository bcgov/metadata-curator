resource "random_string" "postgresSuperPassword" {
  length           = 16
  special          = false
  override_special = "/@\" "
  count = "${makeKeycloak} ? 1 : 0"
}

resource "random_string" "postgresAppPassword" {
  length           = 16
  special          = false
  override_special = "/@\" "
  count = "${makeKeycloak} ? 1 : 0"
}

data "docker_registry_image" "postgres" {
  name = "postgres:9.6.9"
  count = "${makeKeycloak} ? 1 : 0"
}

resource "docker_image" "postgres" {
  name          = data.docker_registry_image.postgres.name
  pull_triggers = [data.docker_registry_image.postgres.sha256_digest]
  keep_locally  = true
  count = "${makeKeycloak} ? 1 : 0"
}

resource "docker_container" "mc_postgres" {
  image   = docker_image.postgres.latest
  name    = "mc_postgres"
  restart = "on-failure"
  volumes {
    host_path      = "${var.hostRootPath}/data/postgres"
    container_path = "/var/lib/postgresql/data"
  }
  env = [
    "POSTGRES_USER=padmin",
    "POSTGRES_PASSWORD=${random_string.postgresSuperPassword.result}",
  ]
  networks_advanced {
    name = docker_network.private_network.name
  }

  healthcheck {
    test         = ["CMD-SHELL", "pg_isready -U padmin"]
    interval     = "5s"
    timeout      = "5s"
    start_period = "5s"
    retries      = 20
  }
  count = "${makeKeycloak} ? 1 : 0"
}

data "template_file" "postgres_script" {
  template = file("${path.module}/scripts/psql.tpl")
  vars = {
    POSTGRES_APP_USERNAME = var.postgres["username"]
    POSTGRES_APP_PASSWORD = random_string.postgresAppPassword.result
  }
  count = "${makeKeycloak} ? 1 : 0"
}

resource "local_file" "postgres_script" {
  content  = data.template_file.postgres_script.rendered
  filename = "${var.hostRootPath}/postgres_script.psql"
  count = "${makeKeycloak} ? 1 : 0"
}

resource "null_resource" "postgres_first_time_install" {
  provisioner "local-exec" {
    command = "scripts/wait-for-healthy.sh mc_postgres"
  }

  provisioner "local-exec" {
    environment = {
      SCRIPT_PATH       = var.hostRootPath
      POSTGRES_USER     = "padmin"
      POSTGRES_PASSWORD = random_string.postgresSuperPassword.result
    }
    command = "sleep 10 && docker run --net=mc_vnet -v \"$SCRIPT_PATH:/work\" postgres:9.6.9 psql postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@mc_postgres -f /work/postgres_script.psql"
  }

  depends_on = [docker_container.mc_postgres]
  count = "${makeKeycloak} ? 1 : 0"
}
