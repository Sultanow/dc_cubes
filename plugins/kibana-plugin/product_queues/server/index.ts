import { PluginInitializerContext } from '../../../src/core/server';
import { ProductQueuesPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new ProductQueuesPlugin(initializerContext);
}

export { ProductQueuesPluginSetup, ProductQueuesPluginStart } from './types';
