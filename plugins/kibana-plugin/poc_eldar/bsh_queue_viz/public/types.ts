import { NavigationPublicPluginStart } from '..\..\../src/plugins/navigation/public';

export interface BshQueueVizPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BshQueueVizPluginStart {}

export interface AppPluginStartDependencies { 
  navigation: NavigationPublicPluginStart 
};
