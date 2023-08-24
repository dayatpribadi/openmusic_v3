const ClientError = require('../../except/ClientError');

class ActivitiesHandler {
  constructor(activityService, playlistsService) {
    this._activityService = activityService;
    this._playlistsService = playlistsService;

    this.postActivitysHandler = this.postActivitysHandler.bind(this);
    this.getActivitysHandler = this.getActivitysHandler.bind(this);
  }

  async postActivitysHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(id, credentialId);
      const activityId = await this._activityService.addActivity(id);

      const response = h.response({
        status: 'success',
        message: 'Activity berhasil ditambahkan',
        data: {
          activityId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getActivitysHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id } = request.params;

      await this._playlistsService.verifyPlaylistOwner(id, credentialId);
      const data = await this._activityService.getActivities(id);

      return {
        status: 'success',
        data,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ActivitiesHandler;
