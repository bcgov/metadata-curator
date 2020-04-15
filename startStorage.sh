export MINIO_ACCESS_KEY=accessKey
export MINIO_SECRET_KEY=secretKey
export AWS_ACCESS_KEY_ID=$MINIO_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=$MINIO_SECRET_KEY
export AWS_REGION=us-east-1

minio server ./tmp &
tusd -s3-endpoint http://localhost:9000 -s3-bucket data