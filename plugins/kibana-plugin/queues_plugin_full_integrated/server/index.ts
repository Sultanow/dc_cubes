import { PluginInitializerContext } from '../../../src/core/server';
import { QueuesPluginPlugin } from './plugin';

//  This exports static code and TypeScript types,
//  as well as, Kibana Platform `plugin()` initializer.

export function plugin(initializerContext: PluginInitializerContext) {
  return new QueuesPluginPlugin(initializerContext);
}

export { QueuesPluginPluginSetup, QueuesPluginPluginStart } from './types';
