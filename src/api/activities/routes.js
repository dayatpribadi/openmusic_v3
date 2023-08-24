const routes = (handler) => [
    {
      method: 'GET',
      path: '/playlists/{id}/activities',
      handler: handler.getActivitysHandler,
      options: {
        auth: 'openmusic_jwt',
      },
    },
    {
      method: 'POST',
      path: '/playlists/{id}/activities',
      handler: handler.postActivitysHandler,
      options: {
        auth: 'openmusic_jwt',
      },
    },
  ];

  module.exports = routes;
