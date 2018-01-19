FROM mhart/alpine-node:8

WORKDIR /app
ADD . /app

RUN apk add --no-cache make gcc g++ python git postgresql-dev

RUN npm install --production

# Settings for the node app to use to connect to the Postgres database.
# The value for PGHOST must match the postgres service name given in 'docker-compose.yml'.
ENV PGHOST postgres
ENV PGUSER postgres
ENV PGPORT 5432

# Set the port that the node app will run on
ENV HTTP_PORT 80

EXPOSE $HTTP_PORT

CMD ["node", "app.js"]
