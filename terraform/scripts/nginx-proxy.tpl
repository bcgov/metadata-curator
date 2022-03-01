map $http_upgrade $connection_upgrade {
  default upgrade;
  "" close;
}

server {
  listen                    443 ssl;
  server_name               ${authHostname};

  ssl_certificate           ${sslCertificate};
  ssl_certificate_key       ${sslCertificateKey};

  location = / {
    return 301 /auth;
  }

  # Proxy everything over to the service
  location /auth/ {
    resolver 127.0.0.11 ipv6=off valid=30s;
    proxy_set_header        Host            $host;
    proxy_set_header        X-Real-IP       $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        X-Forwarded-Proto $scheme;
    proxy_http_version      1.1;
    proxy_set_header         Upgrade $http_upgrade;
    proxy_set_header         Connection $connection_upgrade;
    proxy_pass http://mc_keycloak:8080;
  }
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
    resolver 127.0.0.11 ipv6=off valid=30s;
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

  location /formio {
    resolver 127.0.0.11 ipv6=off valid=30s;
    proxy_set_header        Host            $host;
    proxy_set_header        X-Real-IP       $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        X-Forwarded-Proto $scheme;
    proxy_http_version      1.1;
    proxy_set_header         Upgrade $http_upgrade;
    proxy_set_header         Connection $connection_upgrade;

    rewrite /formio/(.*) /$1  break;
    proxy_redirect off;
    proxy_pass http://mc_formio:3001 ;
  }

  location /files {
    resolver 127.0.0.11 ipv6=off valid=30s;
    
    proxy_hide_header Access-Control-Allow-Origin;
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Headers x-http-method-override;
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
    
    proxy_pass http://mc_tusd:1080/files;

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

  location /socket {
    resolver 127.0.0.11 ipv6=off valid=30s;
    proxy_set_header        Host            $host;
    proxy_set_header        X-Real-IP       $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        X-Forwarded-Proto $scheme;
    proxy_http_version      1.1;
    proxy_set_header        Upgrade $http_upgrade;
    proxy_set_header        Connection $connection_upgrade;

    set $backend "http://forum_api:3001";

    proxy_pass $backend;
  }

  # Proxy everything else to the frontend
  location / {
    resolver 127.0.0.11 ipv6=off valid=30s;

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
  listen                    443 ssl default;
  ssl_certificate           ${sslCertificate};
  ssl_certificate_key       ${sslCertificateKey};

  return 301 ${authHost};
}

server {
  listen                    80 default;

  return 301 ${host};
}
