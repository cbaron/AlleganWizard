#!/bin/bash
set -ex

docker build --pull -t https://github.com/cbaron/AlleganWizard.git -f Dockerfile.base .
docker push https://github.com/cbaron/AlleganWizard.gitregistry.tureus.com/iot:base
