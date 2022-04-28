map $http_upgrade $connection_upgrade {
  default upgrade;
  "" close;
}

server {
  listen                    443 ssl;
  server_name               ${hostname};

  ssl_certificate           ${sslCertificate};
  ssl_certificate_key       ${sslCertificateKey};

  location /version {
      root   /www;
      index  index.html;
  }
  
  location /minio/ {
    resolver 127.0.0.11 valid=30s;
    proxy_set_header        Host            $host;
    proxy_set_header        X-Real-IP       $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        X-Forwarded-Proto $scheme;
    proxy_http_version      1.1;
    proxy_set_header         Upgrade $http_upgrade;
    proxy_set_header         Connection $connection_upgrade;
    proxy_read_timeout 14400;
    proxy_connect_timeout 14400;
    proxy_send_timeout 14400;

    proxy_pass http://mc_minio:9000;
  }

  location /files {
    resolver 127.0.0.11 valid=30s;

    proxy_pass http://mc_tusd:1080/files;

    # Disable request and response buffering
    proxy_request_buffering  off;
    proxy_buffering          off;
    proxy_http_version       1.1;
    proxy_read_timeout 14400;
    proxy_connect_timeout 14400;
    proxy_send_timeout 14400;

    if ($request_method = DELETE)
    {
        return 405;
    }

    if ($request_method = GET)
    {
        return 405;
    }

    # Add X-Forwarded-* headers
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header        Host            $host;
    proxy_set_header        X-Real-IP       $remote_addr;

    proxy_set_header         Upgrade $http_upgrade;
    proxy_set_header         Connection $connection_upgrade;
    client_max_body_size     0;
  }

  location /socket {
    resolver 127.0.0.11 ipv6=off valid=30s;
    proxy_set_header        Host            $host;
    proxy_set_header        X-Real-IP       $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        X-Forwarded-Proto $scheme;
    proxy_http_version      1.1;
    proxy_set_header        Upgrade $http_upgrade;
    proxy_set_header        Connection $connection_upgrade;

    set $backend "http://mc_forum_api:3001";

    proxy_pass $backend;
  }

  location /mcsocket {
    resolver 127.0.0.11 ipv6=off valid=30s;
    proxy_set_header        Host            $host;
    proxy_set_header        X-Real-IP       $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        X-Forwarded-Proto $scheme;
    proxy_http_version      1.1;
    proxy_set_header        Upgrade $http_upgrade;
    proxy_set_header        Connection $connection_upgrade;

    set $backend "http://mc_backend:3030";

    proxy_pass $backend;
  }

  # Proxy everything else to the frontend
  location / {
    resolver 127.0.0.11 valid=30s;

    set $backend "http://mc_frontend:8080";
    proxy_pass $backend;

    # Disable request and response buffering
    proxy_request_buffering  off;
    proxy_buffering          off;
    proxy_http_version       1.1;

    # Add X-Forwarded-* headers
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_set_header        Host            $host;
    proxy_set_header        X-Real-IP       $remote_addr;

    proxy_set_header         Upgrade $http_upgrade;
    proxy_set_header         Connection $connection_upgrade;
    client_max_body_size     0;
  }

}

server {
  listen                    80 default;

  return 301 ${host};
}
