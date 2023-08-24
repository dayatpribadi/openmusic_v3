const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapAlbumsDB } = require('../../utils');
const InvariantError = require('../../except/InvariantError');
const NotFoundError = require('../../except/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year, cover }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, year, cover],
    };

    const fetch = await this._pool.query(query);

    if (!fetch.rows[0].id) {
      throw new InvariantError('Album failed to add');
    }

    return fetch.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapAlbumsDB);
  }

  async getAlbumById(id) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const resultAlbum = await this._pool.query(queryAlbum);

    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album not found');
    }

    const querySong = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN albums ON albums.id=songs."albumId" WHERE albums.id=$1',
      values: [id],
    };

    const resultSong = await this._pool.query(querySong);

    return { albums: resultAlbum.rows[0], songs: resultSong.rows };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const fetch = await this._pool.query(query);

    if (!fetch.rows.length) {
      throw new NotFoundError('Failed to update album. ID not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const fetch = await this._pool.query(query);

    if (!fetch.rows.length) {
      throw new NotFoundError('Failed to delete album. ID not found');
    }
  }

  async addCoverAlbumById(id, cover) {
    const query = {
      text: 'UPDATE albums SET "cover" = $1 WHERE id = $2 RETURNING id',
      values: [cover, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui cover. Id tidak ditemukan');
    }
  }

  async checkAlbumExist(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}
module.exports = AlbumsService;
