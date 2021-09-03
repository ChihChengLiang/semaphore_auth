#!/bin/bash
set -e

echo "Building hojicha-build"
docker build -f Dockerfile -t hojicha-build --target hojicha-build --build-arg NODE_CONFIG_ENV=goerli .

echo "Building images using docker-compose"
docker-compose -f docker/docker-compose-goerli.yaml build
