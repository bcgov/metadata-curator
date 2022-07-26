
terraform {
  required_version = ">= 0.13"
  required_providers {
    docker = {
      source = "kreuzwerker/docker"
      version = "2.13.0"
    }
    local = {
      source = "hashicorp/local"
    }
    null = {
      source = "hashicorp/null"
    }
    random = {
      source = "hashicorp/random"
    }
    template = {
      source = "hashicorp/template"
    }
    tls = {
      source = "hashicorp/tls"
      version = "3.4.0"
    }
  }
}
