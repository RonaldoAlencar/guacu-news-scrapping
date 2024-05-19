FROM node:20-alpine3.19

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "run", "start:prod"]