FROM node:26-alpine
WORKDIR /usr/src/bot
RUN git pull
COPY package*.json ./
RUN npm ci
COPY . . 
CMD ["node", "index.js"]
