#Build production frontend	
FROM node:14.18.1 as build-stage	
WORKDIR /app	
COPY ./package*.json ./	
# RUN apk add --update g++ make py-pip
RUN npm ci --no-optional	

COPY ./ ./	
ENV NODE_ENV "production"
RUN npm run build	


#Actual container

FROM abiosoft/caddy:1.0.0-no-stats

WORKDIR /app

COPY Caddyfile /etc/Caddyfile

WORKDIR /app
COPY --from=build-stage /app/dist /app

ENV NODE_ENV "production"

EXPOSE 8080