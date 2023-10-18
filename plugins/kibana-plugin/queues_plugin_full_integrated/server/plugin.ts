import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { QueuesPluginPluginSetup, QueuesPluginPluginStart } from './types';
import { defineRoutes } from './routes';

export class QueuesPluginPlugin
  implements Plugin<QueuesPluginPluginSetup, QueuesPluginPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('queues-plugin: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('queues-plugin: Started');
    return {};
  }

  public stop() {}
}
