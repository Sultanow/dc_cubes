# Quick Install
## Setup Development Environment
download and install nvm from
https://github.com/coreybutler/nvm-windows/releases

```
cd C:\Development\
git clone https://github.com/elastic/kibana.git kibana
git checkout v7.8.1
cd C:\development\kibana\
nvm install 10.21.0 --reinstall-packages-from=10.16.3
nvm use 10.21.0
yarn policies set-version 1.22.4
yarn kbn bootstrap
node scripts/generate_plugin bsh_queue_viz
```
## Start Elasticsearch
We currently use Elasticsearch version 7.8.1.
```
set ES_JAVA_OPTS="-Xms4g -Xmx4g"
cd c:\development\elasticsearch-7.8.1\bin
.\elasticsearch.bat
```

## Start Plug-In with Kibana
```
cd C:\development\kibana\plugins\bsh_queue_viz\
npm start
```
Now we can call http://localhost:5601/ in a browser.

# Screenshot
<img src="doc/bsh_queues.png">

# Architecture
tbd
