# 
# Script for starting dc_cubes with docker
# Note: In order to run dc_cubes you need to build it with buildAndRun.sh first
#

# Variables
DC_CUBES=dc_cubes
DC_CUBES_SOLR=dc_cubes_solr

# Start dc_cubes_solr
docker start $DC_CUBES_SOLR

# Start dc_cubes
docker start $DC_CUBES