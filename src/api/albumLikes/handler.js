const ClientError = require('../../except/ClientError');


class AlbumLikesHandler {
  constructor(service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;

    this.postLikesHandler = this.postLikesHandler.bind(this);
    this.getLikesHandler = this.getLikesHandler.bind(this);
    this.deleteLikesHandler = this.deleteLikesHandler.bind(this);
  }

  async postLikesHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { albumId } = request.params;

      await this._albumsService.checkAlbumExist(albumId);

      const alreadyLiked = await this._service.checkAlreadyLike(
        credentialId,
        albumId,
      );

      if (!alreadyLiked) {
        const likeId = await this._service.addAlbumLike(credentialId, albumId);

        const response = h.response({
          status: 'success',
          message: `Berhasil melakukan like pada album dengan id: ${likeId}`,
        });
        response.code(201);
        return response;
      }
      
      // await this._service.deleteAlbumLike(credentialId, albumId);

      const response = h.response({
        status: 'fail',
        message: 'Anda sudah menyukai album dengan id: ${albumId}',
      });
      response.code(400);
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

  async getLikesHandler(request, h) {
    try {
      const { albumId } = request.params;

      const data = await this._service.getLikesCount(albumId);
      const likes = data.count;

      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.header('X-Data-Source', data.source);
      response.code(200);
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

  async deleteLikesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { albumId } = request.params;

    await this._service.deleteAlbumLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Anda berhasil menghapus like pada Album',
    });
    return response;
  }  
}

module.exports = AlbumLikesHandler;
