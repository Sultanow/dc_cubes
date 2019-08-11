#!/bin/bash
SOLR_PROTOCOL=http
SOLR_HOST=dc_cubes_solr # Docker container name
SOLR_PORT=8983
SOLR_CORE=dc_cubes
SOLR_BASE_URL=$SOLR_PROTOCOL://$SOLR_HOST:$SOLR_PORT/solr/$SOLR_CORE

#CSV Settings
CSVFILE=/sample-data/df_all_pseudo-01.csv # or df_all_pseudo-01_small.csv

# Read CSV and Import into solr
importCSV()
{
    # Import sample data
    echo "Start importing sample data on: $SOLR_BASE_URL"
    # Check file
    [ ! -f $CSVFILE ] && { echo "$CSVFILE file not found"; exit 99; }
    
    COUNTER=0

    while IFS=, read -r nr timestamp host cluster dc perm instanz verfahren service response count minv maxv avg var dev_upp dev_low perc90 perc95 perc999 sum sum_of_squares server
    do

        ((COUNTER++))
        if [ $COUNTER == 1 ]; then
            echo "Skipping header line in csv..."
            continue # Skip first header line
        fi

        data="{ \"timestamp\": \"$timestamp\",
            \"host\": \"$host\",
            \"cluster\": $cluster,
            \"dc\": $dc,
            \"perm\": $perm,
            \"instanz\": \"$instanz\",
            \"verfahren\": \"$verfahren\",
            \"service\": \"$service\",
            \"response\": $response,
            \"count\": $count,
            \"minv\": $minv,
            \"maxv\": $maxv,
            \"avg\": $avg,
            \"var\": $var,
            \"dev_upp\": $dev_upp,
            \"dev_low\": $dev_low,
            \"perc90\": $perc90,
            \"perc95\": $perc95,
            \"perc99.9\": $perc999,
            \"sum\": $sum,
            \"sum_of_squares\": $sum_of_squares,
            \"server\": \"$server\"
        }"

        # echo $data

        # Import - TODO: Make use of commit interval! => Speed up
        curl -s -X POST -H 'Content-Type: application/json' \
        'http://dc_cubes_solr:8983/solr/dc_cubes/update/json/docs' \
        --data-binary "$data" > /dev/null # Make curl silent - TODO: debug=true parameter

        # Commit after 1000 entries
        if [ $(($COUNTER % 1000)) == 0 ]; then
            echo "Commiting..."
            curl -s 'http://dc_cubes_solr:8983/solr/dc_cubes/update?commit=true' > /dev/null
            echo "Commit done."
            echo -e "\n $COUNTER entries imported."
        fi

    done < $CSVFILE

    curl 'http://dc_cubes_solr:8983/solr/dc_cubes/update?commit=true'
    echo -e "\n Done. \n $COUNTER entries imported."
}

importCSV