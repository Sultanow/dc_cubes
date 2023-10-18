import { resolve } from 'path';
import { existsSync } from 'fs';


import { i18n } from '@kbn/i18n';

import exampleRoute from './server/routes/example';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'DC Cubes',
    uiExports: {
      app: {
        title: 'DC Cubes (alpha)',
        description: 'DC Cubes uses 3D to visualize the infrastructure data and relies on a city visualization metaphor. A district in the city is a cluster, a house represents a server, the height of a house is the altitude of a metric of the server.',
        main: 'plugins/dc_cubes_plugin/app',
      },
      hacks: [
        'plugins/dc_cubes_plugin/hack'
      ],
      styleSheetPaths: [resolve(__dirname, 'public/app.scss'), resolve(__dirname, 'public/app.css')].find(p => existsSync(p)),
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) { // eslint-disable-line no-unused-vars
        const xpackMainPlugin = server.plugins.xpack_main;
        if (xpackMainPlugin) {
          const featureId = 'dc_cubes_plugin';

          xpackMainPlugin.registerFeature({
            id: featureId,
            name: i18n.translate('dcCubesPlugin.featureRegistry.featureName', {
              defaultMessage: 'dc_cubes_plugin',
            }),
            navLinkId: featureId,
            icon: 'questionInCircle',
            app: [featureId, 'kibana'],
            catalogue: [],
            privileges: {
              all: {
                api: [],
                savedObject: {
                  all: [],
                  read: [],
                },
                ui: ['show'],
              },
              read: {
                api: [],
                savedObject: {
                  all: [],
                  read: [],
                },
                ui: ['show'],
              },
            },
          });
        }

      // Add server routes and initialize the plugin here
      exampleRoute(server);
    }
  });
}
