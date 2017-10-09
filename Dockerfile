FROM mhart/alpine-node:8

WORKDIR /app
COPY . .

RUN apk add --no-cache make gcc g++ python git postgresql-dev

RUN npm install --production

CMD ["node", "app.js"]
