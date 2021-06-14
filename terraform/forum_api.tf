data "docker_registry_image" "forum_api" {
  name = "${var.images["forum_api"]}"
}

resource "docker_image" "forum_api" {
  name          = data.docker_registry_image.forum_api.name
  pull_triggers = [data.docker_registry_image.forum_api.sha256_digest]
}

resource "docker_container" "forum_api" {
  image   = docker_image.forum_api.latest
  name    = "mc_forum_api"
  restart = "on-failure"
  networks_advanced {
    name = docker_network.private_network.name
  }
  env = [
    "JWT_SECRET=${random_string.jwtSecret.result}",
    "LOG_LEVEL=debug",
    "API_PORT=3000",
    "WS_PORT=3001",
    "DB_HOST=mc_mongodb",
    "DB_PORT=27017",
    "DB_NAME=oc_db",
    "DB_USERNAME=${var.mongodb["username"]}",
    "DB_PASSWORD=${random_string.mongoSuperPassword.result}",
    "USER_ID_FIELD=${var.userIdField}",
    "EMAIL_FIELD=${var.emailField}",
    "GIVENNAME_FIELD=${var.givenNameField}",
    "SURNAME_FIELD=${var.surnameField}",
    "GROUP_FIELD=${var.groupField}",
    "DEFAULT_ACCESS_IS_GROUP=${var.defaultAccessIsGroup}",
    "REQUIRED_CREATE_ROLE=${var.requiredCreateRole}",
    "IGNORE_GROUPS=${var.ignoreGroups}",
    "ADMIN_GROUP=${var.adminGroup}",
    "EMAIL_SUBJECT=${var.email["subject"]}",
    "EMAIL_ENABLED=${var.email["enabled"]}",
    "EMAIL_USER=${var.email["user"]}",
    "EMAIL_PASSWORD=${var.email["pass"]}",
    "EMAIL_FROM=${var.email["from"]}",
    "EMAIL_SERVICE=${var.email["service"]}",
    "EMAIL_PORT=${var.email["port"]}",
    "EMAIL_SECURE=${var.email["secure"]}",
  ]
}

