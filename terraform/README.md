# Terraform-Based deployment

Create a terraform.tfvars file (see terraform.tfvars.example):
```
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

(Local Development mac/linux) Modify `/etc/hosts` file to point your chosen domain (mc.example.demo) to 127.0.0.1
```
sudo nano /etc/hosts
```

Run the following commands:

```
terraform init
terraform plan -var hostRootPath=`pwd`/_tmp
terraform apply -var hostRootPath=`pwd`/_tmp -auto-approve
```

# Seeding with test data
```
docker exec -ti mc_backend node_modules/.bin/md-seed run --dropdb
```
