# How to Contribute?

### Kibana Plugin Development Environment

- [Github - Kibana Releases](https://github.com/elastic/kibana/releases)
  - Download Version 7.8.1
  - Important: Used Elasticseach version has to match Verison of Kibana Source Code (7.8)
  - Start Elasticsearch 7.8
    - ``brew services start elasticsearch``
  - rename Directory to `/kibana` not "kibana-7.8.1" !!

- Download Kibana Source Code from Elastic Website
- 1. go to kibana directory
  - important has to be named as "kibana"
- Elasticserarch muss selbe Version haben wie Kibana (Source Code)
- ```git init```
- Install missing module 
  ```yarn add fsevents```
- Change node version with nvm:
  ```nvm use```
  - when not requested version install install via nvm
    ```nvm install X.X.X```
- 2. install bootstrap kibana via yarn
  -> yarn installed? -> Muss verwendet werden, funktioniert nicht mit npm
  ```
  yarn kbn bootstrap
  ```
- 3. start kibana
  ```
  yarn start --oss
  ````
  - basepath proxy server running at http://localhost:5601/XXX

---

## Development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment.
