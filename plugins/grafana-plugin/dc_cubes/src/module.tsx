import { PanelPlugin } from '@grafana/data/';
import { App } from './App';
import { EditorPanel } from './components/settings/EditorPanel';

export const plugin = new PanelPlugin(App);
plugin.setDefaults({
  aggregationType: 'avg',
  selectedMeasure: 'count',
  predictionActivated: false,
  dataSource: 'solr',
  solrBaseUrl: 'http://localhost:8983/solr/',
  solrHistoricalCore: 'dc_cubes',
  solrForecastCore: 'dc_cubes_forecast',
  solrMergedCore: 'dc_cubes_merged',
});
plugin.setEditor(EditorPanel);
//plugin.setPanelChangeHandler
