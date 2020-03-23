#!/bin/bash
set -e

echo "Building hojicha-build"
docker build -f Dockerfile -t hojicha-build --target hojicha-build --build-arg NODE_ENV=gorli .

echo "Building images using docker-compose"
docker-compose -f docker/docker-compose-gorli.yaml build
