# Requirements

* elasticsearch dump >= v6.16.2
* node >= v10
* Java >= 1.8
* elasticsearch >= v7

# Setup

## Install & run Elasticsearch with .zip on Windows

### Download & Install the .zip package

Download th .zip archive for Elasticsearch v7.7.0 from: <a href="https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.7.0-windows-x86_64.zip">elasticsearch-7.7.0-windows-x86_64.zip</a>

Unzip it with your favourite unzip tool. This will create a folder called elasticsearch-7.7.0, which we will refer to as %ES_HOME%

### Running Elasticsearch from the command line

Elasticsearch can be started from the command line as follows:

```
.\bin\elasticsearch.bat
```

## Install Elasticsearch on macOS with Homebrew

###### Tab the Elastic Homebrew:
```
brew tap elastic/tap
```

###### Tab the Elastic Homebrew:
```
brew install elastic/tap/elasticsearch-full
```

###### Directory layout for Homebrew installs:

| Type | Description | Default Location| 
|------|-------------|-----------------|
| home | Elasticsearch home directory or $ES_HOME | /usr/local/var/homebrew/linked/elasticsearch-full |
|bin|Binary scripts including elasticsearch to start a node and elasticsearch-plugin to install| |/usr/local/var/homebrew/linked/elasticsearch-full/bin|
|conf|Configuration files including elasticsearch.yml|/usr/local/etc/elasticsearch|
|data|The location of the data files of each index / shard allocated on the node. Can hold multiple locations.|/usr/local/var/lib/elasticsearch|
|logs|Log files location.|/usr/local/var/log/elasticsearch|
|plugins|Plugin files location. Each plugin will be contained in a subdirectory.|/usr/local/var/homebrew/linked/elasticsearch/plugins|

## Install Elasticsearch with Docker

###### Pulling the image

```
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.7.0
```

###### Starting a single node cluster with Docker

```
docker run -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.7.0
```

## Install Elasticsearch from archive on LInux or MacOS

### Download and install archive for MacOS

The MacOS archive for Elasticsearch v7.7.0 can be downloaded and installed as follows:

```
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.7.0-darwin-x86_64.tar.gz
```
```
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.7.0-darwin-x86_64.tar.gz.sha512
```
```
shasum -a 512 -c elasticsearch-7.7.0-darwin-x86_64.tar.gz.sha512 
```
```
tar -xzf elasticsearch-7.7.0-darwin-x86_64.tar.gz
```
```
cd elasticsearch-7.7.0/ 
```


## Elasticsearch data structure
Index ``queue`` stores historical data within the following structure

| field | type | example |description|
|-------|------|---------|-----------|
|timestamp|date|2019-12-07T09:25:01.514596+00:00|ISO 8601|
|name|text|products|name of the queue|
|tier|text|pic|reference to logical component in software landscape|
|size|long|2|number of items in the queue|
|items|text|1319622950 74533036|space delimited (anomynized) list of items in queue|
|querytime|long|46|number of milliseconds taken to capture queue content|

A separate index ``queue-prediciton`` is used to store the prediction data. This has the advantage of fast deletion of predictions by deleting the corresponding index. A text field ``model`` is used to reference a particular prediction model. This supports holding multiple prediciton models in one index and being able to visualize them simultanously. The following fields are used for the ``queue-prediction`` index:

| field | type | example |description|
|-------|------|---------|-----------|
|timestamp|date|2019-12-07T09:25:01.514596+00:00|ISO 8601|
|name|text|products|name of the queue|
|tier|text|pic|reference to logical component in software landscape|
|size|long|2|number of items in the queue|
|items|text|1319622950 74533036|space delimited (anomynized) list of items in queue|
|model|text|lstm|reference to the model used to calculate prediction values|

Both indices are only alias names and may facilitate [Elasticsearch index lifecycle management](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-index-lifecycle-management.html) to provide index rollover.

## elasticdump

A native elastic search interface for driving the ML learning and prediction phase has not yet been used. Instead a line wise JSON gzip format is used to exchange data between the elasticsearch and ML components: elasticsearch dump v6.16.2 https://github.com/taskrabbit/elasticsearch-dump

Exported data can be viewed directly:

``` 
$ zcat 20200101-queues-sample.json.gz | less
```

### import

The following command would import a dump into the elasticsearch index ``queues``:

``` 
$ gunzip 20200101-queues-sample.json.gz
$ ./elasticsearch-dump-6.16.2/bin/elasticdump --output=http://localhost:9200/queues --input=./20200101-queues-sample.json --type=data
 ```
If the index ``queues`` is used the first time and index pattern has to be created first:
 
Kibana Management / Kibana Index Patterns / Create Index Pattern
 
Search for "queues" and click "next step", set time filter field name to "timestamp" and click "Create index pattern". Switch to Kibana discover view and select "queues" index pattern to browse data.

Elasticdump requires node >= v10. Some functions of elasticdump are working with node >= v8, but be prepared to get some error messages depending on the usage pattern.

### export

Some example scripts to demonstrate different export use case

limit to 100 items for testing purpose:
```
$ elasticdump --input=http://localhost:9200/queues --output=./queues.json --type=data --size=100
```

anomynize items during export:
```
$ elasticdump --input=http://localhost:9200/queues --output=./queues.json --transform='@./elasticsearch-dump-6.16.2/transforms/anonymize_items' --type=data
```

export specific queues omitting the data hungry items:
```
$ elasticdump --input=http://localhost:9200/queues --output=./queues.json --type=data --searchBody='{"query":{"terms":{"name": ["products", "productrelations"]}},"_source": {"excludes": "items"}}'
```

directly gzip:
```
$ elasticdump --input=http://localhost:9200/queues --output=$ --type=data | gzip > queues.json.gz
```

sort by timestamp, excludes items, long running with ``nohup``:
```
nohup sh -c "./elasticsearch-dump-6.16.2/bin/elasticdump --input=http://localhost:9200/queues --output=$ --type=data --searchBody='{\"_source\": {\"excludes\": \"items\"} , \"sort\": [{\"timestamp\": {\"order\": \"asc\"}}]}' | gzip > queues.json.gz" > elasticdump_nohub.out 2>&1 &
```

export time window, sort items by timestamp, long running with ``nohup``:
```
nohup sh -c "./elasticsearch-dump-6.16.2/bin/elasticdump --input=http://localhost:9200/queues --output=$ --type=data --searchBody='{\"query\":{ \"bool\": { \"filter\": [{\"range\": {\"timestamp\": {\"gte\": \"2020-04-01T00:00:00.000Z\",\"lte\": \"2020-05-01T00:00:00.000Z\",\"format\": \"strict_date_optional_time\"}}}]}}, \"sort\": [{\"timestamp\": {\"order\": \"asc\"}}]}' --transform='@./elasticsearch-dump-6.16.2/transforms/anonymize_items' | gzip > queues.json.gz" > elasticdump_nohub.out 2>&1 &
```

### troubleshooting for elasticdump

If there is an error regarding the import of data into elasticsearch via elasticdump a solution can be to create the index first before importing the data. Use the following mapping in kibana via Dev Tools

```
PUT /queues
{
  "settings": {
    "number_of_shards": 1
  },
  "mappings": {
     "properties": {
        "items": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "name": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "querytime": {
          "type": "long"
        },
        "size": {
          "type": "long"
        },
        "tier": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "timestamp": {
          "type": "date"
        }
      }
  }
}
```

