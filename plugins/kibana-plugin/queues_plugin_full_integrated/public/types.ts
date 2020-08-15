import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface QueuesPluginPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface QueuesPluginPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
