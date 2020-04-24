

# Terraform-Based deployment

Create a terraform.tfvars file (see terraform.tfvars.example):

Run the following commands:

```
terraform init

terraform plan -var hostRootPath=`pwd`/_tmp

terraform apply -var hostRootPath=`pwd`/_tmp -auto-approve
```
