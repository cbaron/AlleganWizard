#!/bin/bash

TAG=$(date +%Y-%m-%d-%H-%M)

docker build -t registry.tureus.com/iot:$TAG .
docker push registry.tureus.com/iot:$TAG

kubectl --namespace=tellient set image deploy/iot-production iot-webapp=registry.tureus.com/iot:$TAG
kubectl --namespace=tellient set image deploy/iot-production marketplace=registry.tureus.com/iot:$TAG
