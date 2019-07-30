$solrProtocol = "http";

$solrHost = "localhost"

$solrPort = 8983

$solrCore = "test";

$solrBaseUrl = "$($solrProtocol)://$($solrHost):$($solrPort)/solr/$($solrCore)/";


function SaveItem($timestamp, $hosti, $cluster, $dc, $perm, $instanz, $verfahren, $response, $count, $minv, $maxv, $avg, $var, $dev_upp, $dev_low, $perc90, $perc95, $perc99, $sum, $sum_of_squares, $server ) {

  $item = @{

    timestamp=$timestamp;
    host=$hosti;
    cluster=$cluster;
    dc=$dc;
    perm=$perm;
    instanz=$instanz;
    verfahren=$verfahren;
    service=$verfahren;
    response=$response;
    count=$count;
    minv=$minv;
    maxv=$maxv;
    avg=$avg;
    var=$var;
    dev_upp=$dev_upp;
    dev_low=$dev_low;
    perc90=$perc90;
    perc95=$perc95;
    perc99=$perc99;
    sum=$sum;
    sum_of_squares=$sum_of_squares;
    server=$server;


  };

  $json = $item | ConvertTo-Json;

  #echo $json;

 
# TODO: commit nach 10000 Einträgen
  Invoke-RestMethod -Uri "$($SCRIPT:solrBaseUrl)update/json/docs?commit=true" -Method Post -Body $json -ContentType "application/json";



}



$csv = Import-Csv .\df_all_pseudo-01.csv


$csv | ForEach-Object{
    
    $dummy = "perc99.9"
    SaveItem $_.timestamp $_.hosti $_.cluster $_.dc $_.perm $_.instanz $_.verfahren $_.response $_.count $_.minv $_.maxv $_.avg $_.var $_.dev_upp $_.dev_low $_.perc90 $_.perc95 $_.$dummy $_.sum $_.sum_of_squared $_.server

}