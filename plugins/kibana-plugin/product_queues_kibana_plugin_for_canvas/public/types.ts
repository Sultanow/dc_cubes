import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface ProductQueuesPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProductQueuesPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
