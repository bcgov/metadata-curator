variable "mongodb" {
  type = map(string)
}

variable "formio" {
  type = map(string)
}

variable "host" {
  type = string
}

variable "hostname" {
  type = string
}

variable "hostRootPath" {
  type = string
}

variable "sslCertificate" {
  type = string
}

variable "sslCertificateKey" {
  type = string
}

variable "images" {
  type = map(string)
}

variable "oidc" {
  type = map(string)
}

variable "base64EncodedPGPPublicKey"{
  type = string
}