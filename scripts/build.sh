#!/bin/bash

set -ex

TAG=$(date +%Y-%m-%d-%H-%M)

docker build --pull -t https://github.com/cbaron/AlleganWizard.git:base -f Dockerfile.base .
docker push https://github.com/cbaron/AlleganWizard.git:base

docker build -t https://github.com/cbaron/AlleganWizard.git:$TAG .
docker push https://github.com/cbaron/AlleganWizard.git:$TAG

#kubectl --namespace=tellient set image deploy/iot-production iot-webapp=registry.tureus.com/iot:$TAG
#kubectl --namespace=tellient set image deploy/iot-production marketplace=registry.tureus.com/iot:$TAG
