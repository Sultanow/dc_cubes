import './index.scss';

import { BshQueueVizPlugin } from './plugin';

// This exports static code and TypeScript types, 
// as well as, Kibana Platform `plugin()` initializer. 
export function plugin() {
  return new BshQueueVizPlugin();
}
export {
  BshQueueVizPluginSetup,
  BshQueueVizPluginStart,
} from './types';

