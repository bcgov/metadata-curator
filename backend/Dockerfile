FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-optional --production
RUN mkdir /.config && chmod 777 /.config
COPY ./ ./
EXPOSE 3000
EXPOSE 3030
CMD [ "npm", "start" ]