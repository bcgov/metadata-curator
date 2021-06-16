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

variable "base64EncodedPGPPublicKey" {
  type = string
}

variable "adminGroup" {
  type = string
}

variable "orgAttribute" {
  type = string
}

variable "requiredRoleToCreateRequest" {
  type = string
}

variable "email" {
  type = map(any)
}

variable "alwaysNotifyList" {
  type = any
}

variable "approverGroups" {
  type = list(string)
}

variable "alwaysNotifyUninvolvedOnCommentAdd" {
  type = string
}

variable "alwaysNotifyListOnTopicCreate" {
  type = string
}

variable "userIdField" {
  type = string
}

variable "emailField" {
  type = string
}

variable "givenNameField" {
  type = string
}

variable "surnameField" {
  type = string
}

variable "groupField" {
  type = string
}

variable "defaultAccessIsGroup" {
  type = string
}

variable "ignoreGroups" {
  type = string
}

variable "makeKeycloak"{
  type = bool
}

variable "keycloak" {
  type = map(string)
}

variable "postgres" {
  type = map(string)
}

variable "authHost" {
  type = string
}