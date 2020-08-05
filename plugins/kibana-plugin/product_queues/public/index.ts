import './index.scss';

import { ProductQueuesPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new ProductQueuesPlugin();
}
export { ProductQueuesPluginSetup, ProductQueuesPluginStart } from './types';
