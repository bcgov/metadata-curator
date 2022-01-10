data "docker_registry_image" "minio" {
  name = "minio/minio${var.images["minio"]}"
}

resource "docker_image" "minio" {
  name          = data.docker_registry_image.minio.name
  pull_triggers = [data.docker_registry_image.minio.sha256_digest]
}

resource "docker_container" "minio" {
  image   = docker_image.minio.latest
  name    = "mc_minio"
  restart = "on-failure"
  command = ["server", "/data"]
  networks_advanced {
    name = docker_network.private_network.name
  }
  volumes {
    host_path      = "${var.hostRootPath}/data/minio"
    container_path = "/data"
  }
  volumes {
    host_path      = "${var.hostRootPath}/config/minio"
    container_path = "/root/.minio"
  }
  env = [
    "MINIO_ACCESS_KEY=${random_id.accessKey.hex}",
    "MINIO_SECRET_KEY=${random_string.secretKey.result}",
    "MINIO_API_REQUESTS_DEADLINE=30m",
    "MINIO_API_REQUESTS_MAX=200"
  ]
  healthcheck {
    test         = ["CMD", "curl", "-f", "http://localhost:9000/minio/health/ready"]
    interval     = "5s"
    timeout      = "5s"
    start_period = "10s"
    retries      = 20
  }
}

data "local_file" "pre_create_py" {
  filename = "${path.module}/scripts/pre-create.py"
}

resource "local_file" "pre_create" {
  content  = data.local_file.pre_create_py.content
  filename = "${var.hostRootPath}/config/tusd/pre-create"
}

data "docker_registry_image" "tusd" {
  name = "h3brandon/tusd_py3${var.images["tusd"]}"
}

resource "docker_image" "tusd" {
  name          = data.docker_registry_image.tusd.name
  pull_triggers = [data.docker_registry_image.tusd.sha256_digest]
}

resource "docker_container" "tusd" {
  image = docker_image.tusd.latest
  name  = "mc_tusd"
  volumes {
    host_path      = "${var.hostRootPath}/config/tusd"
    container_path = "/srv/tusd-hooks"
  }
  restart = "on-failure"
  networks_advanced {
    name = docker_network.private_network.name
  }
  env = [
    "AWS_ACCESS_KEY=${random_id.accessKey.hex}",
    "AWS_SECRET_ACCESS_KEY=${random_string.secretKey.result}",
    "AWS_REGION=not_applicable",
    "JWT_SECRET=${random_string.jwtSecret.result}",
    "JWT_AUD=aud",
    "S3_ENDPOINT=http://mc_minio:9000",
    "S3_BUCKET=bucket -behind-proxy",
  ]
}

resource "null_resource" "minio_first_install" {
  provisioner "local-exec" {
    command = "scripts/wait-for-healthy.sh mc_minio"
  }

  provisioner "local-exec" {
    environment = {
      MC_HOST_PRIMARY = "http://${random_id.accessKey.hex}:${random_string.secretKey.result}@mc_minio:9000"
    }
    command = "docker run -e MC_HOST_PRIMARY --net=mc_vnet minio/mc mb PRIMARY/bucket || echo \"owned\""
  }

  depends_on = [docker_container.minio]
}

