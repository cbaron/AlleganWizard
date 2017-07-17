FROM node:8.1

RUN apt-get update && apt-get install -y \
      libpq-dev postgresql-client vim && \
      mkdir /app

WORKDIR app

ADD package.json /app/package.json
RUN npm install --production

ADD . /app

RUN mv .env.dummy .env
CMD ["node", "app.js"]
