import { PluginInitializerContext } from '..\..\../src/core/server';
import { BshQueueVizPlugin } from './plugin';


//  This exports static code and TypeScript types, 
//  as well as, Kibana Platform `plugin()` initializer.
 
 export function plugin(initializerContext: PluginInitializerContext) {
  return new BshQueueVizPlugin(initializerContext);
}

export {
  BshQueueVizPluginSetup,
  BshQueueVizPluginStart,
} from './types';
