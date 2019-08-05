#!/bin/bash
#
# Start Script for spinning up dc_cubes with solr instance
#

# Variables
DOCKER_NETWORK=dc_cubes_network
DC_CUBES_NAME=dc_cubes
NGINX_HOST_PORT=80
SOLR_HOST_PORT=8983
SOLR_CORE_NAME=test

# 0. Clean up - just in case we have some containers already running
docker stop dc_cubes && docker stop dc_cubes_solr
docker rm dc_cubes && docker rm dc_cubes_solr

# 1. Build dc_cubes
echo "Building dc_cubes Docker image..."
docker build -f dc_cubes/Dockerfile -t $DC_CUBES_NAME:v1 .

# 2. Create Docker network
echo "Creating docker network for dc_cubes..."
docker network create $DOCKER_NETWORK

# 3. Run dc_cubes in created network
echo "Spin up dc_cubes container..."
docker run --network $DOCKER_NETWORK -d --name $DC_CUBES_NAME -p $NGINX_HOST_PORT:80 $DC_CUBES_NAME:v1

# 4. Run Solr
echo "Spin up solr"
docker run --network $DOCKER_NETWORK -d -e SOLR_CORE=$SOLR_CORE_NAME --name dc_cubes_solr -p $SOLR_HOST_PORT:8983 bitnami/solr:latest

# 5. Import sample infrastructure data
docker build -f ./solr_importer/Dockerfile -t solr_importer:v1 .

# TODO Run importer with connection to dc_cubes_solr

# docker run --network $DOCKER_NETWORK --rm byrnedo/alpine-curl http://dc_cubes_solr:8983/solr/test/select?q=*%3A*
# docker run --network $DOCKER_NETWORK --rm --name dc_cubes_solr_testdata_importer solr_importer:v1

echo "Done."
echo "Navigate to http://localhost in your browser."