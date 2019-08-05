#!/bin/sh
SOLR_PROTOCOL=http
SOLR_HOST=localhost
SOLR_PORT=8983
SOLR_CORE=test
SOLR_BASE_URL=$SOLR_PROTOCOL://$SOLR_HOST:$SOLR_PORT/solr/$SOLR_CORE

# Init schema
echo "Start creating scheme on: $SOLR_BASE_URL"

: ' curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"timestamp","type":"pdate"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"host","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"cluster","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"dc","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perm","type":"pint"}}'-X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"instanz","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"verfahren","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"service","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"response","type":"pint"}}'-X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"count","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"minv","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"maxv","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"avg","type":"pfloat"}}'-X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"var","type":"pfloat"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"dev_upp","type":"pfloat"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"dev_low","type":"pfloat"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perc90","type":"pfloat"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perc95","type":"pfloat"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perc99","type":pfloat}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"sum","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"sum_of_squares","type":"pint"}}' -X POST $SOLR_BASE_URL/schema
curl -X POST -i -H "Content-type: application/json" -c '{"add-field":{"stored":true,"indexed":false,"multiValued":false,"name":"server","type":"string"}}' -X POST $SOLR_BASE_URL/schema

'


hostip=$(ip route show | awk '/default/ {print $3}')
echo $hostip

curl -i http://dc_cubes_solr:8983

# Import example data