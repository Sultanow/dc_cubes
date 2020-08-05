import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { ProductQueuesPluginSetup, ProductQueuesPluginStart } from './types';
import { defineRoutes } from './routes';

export class ProductQueuesPlugin
  implements Plugin<ProductQueuesPluginSetup, ProductQueuesPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('product_queues: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('product_queues: Started');
    return {};
  }

  public stop() {}
}
