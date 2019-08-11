#!/bin/bash
#
# Start Script for spinning up dc_cubes with solr instance
#

# Variables
DOCKER_NETWORK=dc_cubes_network
DC_CUBES=dc_cubes
DC_CUBES_SOLR=dc_cubes_solr
NGINX_HOST_PORT=80
SOLR_HOST_PORT=8983
SOLR_CORE_NAME=dc_cubes

# 0. Clean up - just in case we have some containers already running
docker stop $DC_CUBES && docker rm $DC_CUBES # Stop dc_cubes
docker stop $DC_CUBES_SOLR && docker rm $DC_CUBES_SOLR # Stop dc_cubes_solr
docker network rm $DOCKER_NETWORK

# 1. Build dc_cubes
echo "Building dc_cubes Docker image..."
docker build --no-cache -f dc_cubes/Dockerfile -t $DC_CUBES:v1 .

# 2. Create Docker network
echo "Creating docker network for dc_cubes..."
docker network create dc_cubes_network --driver bridge

# 3. Run dc_cubes in created network
echo "Spin up dc_cubes container..."
docker run --network $DOCKER_NETWORK --name $DC_CUBES -d -p $NGINX_HOST_PORT:80 $DC_CUBES:v1

# 4. Run Solr
echo "Spin up solr"
docker run --name dc_cubes_solr --network dc_cubes_network -d -e SOLR_CORE=dc_cubes -p 8983:8983 bitnami/solr:latest

# 5. Import sample infrastructure data
docker build --no-cache -f ./solr_importer/Dockerfile -t solr_importer:v1 .
echo "Wait until solr core is ready"
sleep 20 # Todo - check status of core in loop
docker run --rm --network dc_cubes_network --name dc_cubes_solr_testdata_importer solr_importer:v1

# docker run --rm --network dc_cubes_network --name curl-test  byrnedo/alpine-curl http://dc_cubes_solr:8983/solr/dc_cubes/schema -i

echo "Done."
echo "Navigate to http://localhost in your browser."