

# Terraform-Based deployment

Create a terraform.tfvars file (see terraform.tfvars.example):

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
