# Installation instructions for Grafana Plugin

1. Clone the dc_cubes repository to your local workstation
2. Open the root directory of the cloned repository
3. Open the "plugins" folder
4. Open the "grafana-plugin" folder
5. Open the "dc_cubes" folder
6. Copy the folder "dist" to the Plugin Import Directory of your Grafana installations (Default on Linux systems: "/var/lib/grafana/plugins". See here for further guidance regarding the location of the Plugin Folder: https://grafana.com/docs/grafana/latest/plugins/developing/development/#start-developing-your-plugin)
7. Reload Grafana
8. Open Grafana, create a dashboard and select dc_cubes from visualization menu
##### Optional: Start the Server in order to enable the prediction of time series data
9. Open the root directory of the cloned repository
10. Open the "backend" folder
11. Install dependencies
```sh
$ npm install
```
12. Start server
```sh
$ npm start
```

# Development instructions for Grafana Plugin

1. Clone the dc_cubes repository to your local workstation
2. Open the root directory of the cloned repository
3. Open the "plugins" folder
4. Open the "grafana-plugin" folder
5. Open the "dc_cubes" folder
6. Install dependencies
```sh
$ npm install
```
7. Run Linter and other dev utilities from the Grafana Plugin SDK
```sh
$ npm run dev
```
8. Compile, Compress and Deploy production-ready Plugin into the "dist" Folder
```sh
$ npm run build
```
