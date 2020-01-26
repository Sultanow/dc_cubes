import { PanelPlugin } from '@grafana/data/';
import { App } from './App';
import { EditorPanel } from './components/settings/EditorPanel';

export const plugin = new PanelPlugin(App);
plugin.setDefaults({ aggregationType: 'avg', selectedMeasure: 'count', predictionActivated: false, dataSource: 'solr' });
plugin.setEditor(EditorPanel);
//plugin.setPanelChangeHandler
