FROM https://github.com/cbaron/AlleganWizard.git:base

ADD . /app

RUN mv .env.dummy .env
CMD ["node", "app.js"]
