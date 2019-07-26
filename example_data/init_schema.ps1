$solrProtocol = "http";

$solrHost = "localhost"

$solrPort = 8983

$solrCore = "test";

$solrBaseUrl = "$($solrProtocol)://$($solrHost):$($solrPort)/solr/$($solrCore)/";


Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"timestamp","type":"pdate"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"host","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"cluster","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"dc","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perm","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"instanz","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"verfahren","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"service","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"response","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"count","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"minv","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"maxv","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"avg","type":"pfloat"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"var","type":"pfloat"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"dev_upp","type":"pfloat"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"dev_low","type":"pfloat"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perc90","type":"pfloat"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perc95","type":"pfloat"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"perc99","type":pfloat}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"sum","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"docValues":true,"indexed":false,"multiValued":false,"name":"sum_of_squares","type":"pint"}}' -ContentType "application/json"
Invoke-RestMethod -Uri "$($solrBaseUrl)schema" -Method Post -Body '{"add-field":{"stored":true,"indexed":false,"multiValued":false,"name":"server","type":"string"}}' -ContentType "application/json"

