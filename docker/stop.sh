# 
# Script for stoping dc_cubes with docker
#

# Variables
DC_CUBES=dc_cubes
DC_CUBES_SOLR=dc_cubes_solr

# Start dc_cubes_solr
docker stop $DC_CUBES_SOLR

# Start dc_cubes
docker stop $DC_CUBES