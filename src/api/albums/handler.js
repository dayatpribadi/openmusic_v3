const { mapDBToAlbumSongService } = require('../../utils/index');
const ClientError = require('../../except/ClientError');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;
      const albumId = await this._service.addAlbum({ name, year });

      const response = h.response({
        status: 'success',
        message: 'Album added successfully',
        data: {
          albumId,
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

  async getAlbumByIdHandler(request, h) {
      const {
        id,
      } = request.params;
      const album = await this._service.getAlbumById(id);
      const resultMappingAlbum = mapDBToAlbumSongService(album.albums, album.songs);

      const response = h.response({
          status: 'success',
          data: {
              album: resultMappingAlbum,
          },
      });
      return response;
  }

  async putAlbumByIdHandler(request, h) {
      this._validator.validateAlbumPayload(request.payload);
      const {
        id,
      } = request.params;

      await this._service.editAlbumById(id, request.payload);
      const response = h.response({
        status: 'success',
        message: 'Album berhasil diperbarui',
    });
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    const response = h.response({
        status: 'success',
        message: 'Album berhasil dihapus',
    });
    return response;
}
}

module.exports = AlbumsHandler;
