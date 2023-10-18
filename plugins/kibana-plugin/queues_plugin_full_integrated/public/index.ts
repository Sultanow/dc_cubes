import './index.scss';

import { QueuesPluginPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new QueuesPluginPlugin();
}
export { QueuesPluginPluginSetup, QueuesPluginPluginStart } from './types';
