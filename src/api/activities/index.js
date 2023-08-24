const ActivitiesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'activity',
  version: '1.0.0',
  register: async (server, { activityService, playlistsService }) => {
    const activitiesHandler = new ActivitiesHandler(
      activityService,
      playlistsService,
    );
    server.route(routes(activitiesHandler));
  },
};
