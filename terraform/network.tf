resource "docker_network" "private_network" {
  name = "mc_vnet"
  ipam_config{
    subnet = "172.25.0.0/14"
  }
}

