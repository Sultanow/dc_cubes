#!/bin/bash
SOLR_PROTOCOL=http
SOLR_HOST=dc_cubes_solr # Docker container name
SOLR_PORT=8983
SOLR_CORE=dc_cubes
SOLR_BASE_URL=$SOLR_PROTOCOL://$SOLR_HOST:$SOLR_PORT/solr/$SOLR_CORE

# Init schema
echo "Start creating scheme on: $SOLR_BASE_URL"

curl -X POST -i -H "Content-type: application/json" http://dc_cubes_solr:8983/solr/dc_cubes/schema -d \
'
{
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"timestamp","type":"pdate"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"host","type":"string"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"cluster","type":"pint"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"dc","type":"pint"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perm","type":"pint"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"instanz","type":"string"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"verfahren","type":"string"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"service","type":"string"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"response","type":"pint"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"count","type":"pint"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"minv","type":"pint"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"maxv","type":"pint"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"avg","type":"pfloat"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"var","type":"pfloat"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"dev_upp","type":"pfloat"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"dev_low","type":"pfloat"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perc90","type":"pfloat"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perc95","type":"pfloat"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perc99","type":pfloat},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"sum","type":"pint"},
    "add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"sum_of_squares","type":"pint"},
    "add-field":{"stored":true,"indexed":false,"multiValued":false,"name":"server","type":"string"}
}
'

echo -e "\nschema initialized."