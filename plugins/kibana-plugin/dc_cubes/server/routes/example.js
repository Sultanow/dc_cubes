export default function (server) {

  server.route({
    path: '/api/dc_cubes_plugin/example',
    method: 'GET',
    handler() {
      return { time: (new Date()).toISOString() };
    }
  });

}
