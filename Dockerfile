FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# nodemon espera ts-node como dependencia
RUN npm install -D ts-node nodemon typescript

CMD ["npm", "run", "dev"]
