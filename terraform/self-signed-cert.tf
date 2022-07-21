resource "tls_private_key" "example" {
  algorithm   = "ECDSA"
  ecdsa_curve = "P384"
}

resource "tls_self_signed_cert" "example" {
  # key_algorithm   = tls_private_key.example.algorithm
  private_key_pem = tls_private_key.example.private_key_pem

  subject {
    common_name  = "example.demo"
    organization = "ACME Examples, Inc"
    organizational_unit = "Dev"
    street_address = ["123 Fake St"]
    locality = "en"
    province = "bc"
    country = "ca"
    postal_code = "v0z 1a1"
    serial_number = "1234567"
  }

  dns_names = ["*.example.demo"]

  validity_period_hours = 2000

  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth",
  ]
}

resource "local_file" "ssl_key" {
  content  = tls_private_key.example.private_key_pem
  filename = "${var.hostRootPath}/ssl/example.key"
}

resource "local_file" "ssl_cert" {
  content  = tls_self_signed_cert.example.cert_pem
  filename = "${var.hostRootPath}/ssl/example.crt"
}

