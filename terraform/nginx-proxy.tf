data "docker_registry_image" "nginx" {
  name = "nginx:latest"
}

resource "docker_image" "nginx" {
  name          = data.docker_registry_image.nginx.name
  pull_triggers = [data.docker_registry_image.nginx.sha256_digest]
}

resource "docker_container" "mc_nginx" {
  image   = docker_image.nginx.latest
  name    = "mc_nginx"
  restart = "on-failure"
  ports {
    internal = 80
    external = 80
  }
  ports {
    internal = 443
    external = 443
  }
  networks_advanced {
    name = docker_network.private_network.name
    #     ipv4_address = "4.4.4.4"
  }
  volumes {
    host_path      = "${var.hostRootPath}/ssl"
    container_path = "/ssl"
  }
  volumes {
    host_path      = "${var.hostRootPath}/config/nginx"
    container_path = "/etc/nginx/conf.d/"
  }
  volumes {
    host_path      = "${var.hostRootPath}/config/nginx/www"
    container_path = "/www/"
  }

  labels {
    label = "NGINX_CONFIG_MD5"
    value = md5(local_file.proxy.content)
  }

  depends_on = [
    local_file.proxy,
    null_resource.minio_first_install,
  ]
}

data "template_file" "proxy_config" {
  template = file("${path.module}/scripts/nginx-proxy.tpl")
  vars = {
    host              = var.host
    hostname          = var.hostname
    sslCertificate    = var.sslCertificate
    sslCertificateKey = var.sslCertificateKey
  }
}

resource "local_file" "proxy" {
  content  = data.template_file.proxy_config.rendered
  filename = "${var.hostRootPath}/config/nginx/proxy.conf"
}

