# How to Contribute?

### Kibana Plugin App Demo

<img src="/img/demo-plugin-app.png">

### Kibana Plugin App Demo with description

<img src="/img/demo-plugin-app-2.png">

### Kibana Plugin Development Environment and Starting Kibana Plugin App

- [Github - Kibana Releases](https://github.com/elastic/kibana/releases)
  - Download Version 7.8.1
  - Important: Used Elasticseach version has to match Verison of Kibana Source Code (7.8)
  - Start Elasticsearch 7.8
    - ``brew services start elasticsearch``
  - rename Directory to `/kibana` not "kibana-7.8.1" !!

- Download Kibana Source Code from Elastic Website
- 1. go to kibana directory
  - Important has to be named as "kibana"
- ```git init```
- Install missing module 
  ```yarn add fsevents```
- Change node version with nvm:
  ```nvm use```
  - when not requested version installed install via nvm
    ```nvm install X.X.X```
- 2. install bootstrap kibana via yarn
  -> yarn installed? -> Yarn package manager require, Does not work with npm without side effects
  ```
  yarn kbn bootstrap
  ```
- 3. start kibana
  ```
  yarn start --oss
  ````
  - basepath proxy server running at http://localhost:5601/XXX


### Start Custom Kibana Plugin 'queues_plugin_full_integrated'
- 1. Add Kibana Plugin ``dc_cubes/plugins/kibana-plugin/queues_plugin_full_integrated/`` to directory ``/kibana/plugins/`` in your Kibana Development Environment
- 2. ``yarn start --oss``

---

## Kibana Development Documentation

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for additional instructions setting up your development environment.