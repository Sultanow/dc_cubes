#
# Script for importing infrastructure data into solr
#

# Config
$solrProtocol = "http";
$solrHost = "localhost"
$solrPort = 8983
$solrCore = "dc_cubes_forecast";
$solrBaseUrl = "$($solrProtocol)://$($solrHost):$($solrPort)/solr/$($solrCore)/";
$csvFile = "./PresentationPrediction.csv"
$commitSize = 1000;

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

  # Convert to json
  $json = $item | ConvertTo-Json; 

  # Send item to solr
  Invoke-RestMethod -Uri "$($solrBaseUrl)update/json/docs" -Method Post -Body $json -ContentType "application/json" > $null; # no output for faster impot
}

echo "Starting import of $csvFile"
# Stopwatch for measuring import time
$stopwatch =  [system.diagnostics.stopwatch]::StartNew()

$csvContent = Import-Csv $csvFile
$csvSize = $csvContent.count
$counter=0
$csvContent | ForEach-Object{
  $perc99 = "perc99.9" # Bind perc99 solr to perc99.9 in csv
  SaveItem $_.timestamp $_.hosti $_.cluster $_.dc $_.perm $_.instanz $_.verfahren $_.response $_.count $_.minv $_.maxv $_.avg $_.var $_.dev_upp $_.dev_low $_.perc90 $_.perc95 $_.$perc99 $_.sum $_.sum_of_squared $_.server

  $counter++
  # Commit?
  if($counter % $commitSize -eq 0){
    echo "Commiting..."
    # Trigger Commit
    Invoke-RestMethod -Uri "$($solrBaseUrl)update?commit=true" -Method Post > $null;
    echo "$counter entries of $csvSize imported."
  }
}

# Commit one last time
Invoke-RestMethod -Uri "$($solrBaseUrl)update?commit=true" -Method Post > $null;
$stopwatch.Stop();

$time = $stopwatch.Elapsed.ToString('mm\:ss')
echo "Import done in $time. min.";