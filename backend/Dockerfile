FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-optional --production
RUN mkdir /.config && chmod 777 /.config
COPY ./ ./
EXPOSE 3000
CMD [ "npm", "start" ]