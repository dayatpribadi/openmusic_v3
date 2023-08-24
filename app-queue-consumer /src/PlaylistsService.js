const { Pool } = require('pg');

class PlaylistsService {
    constructor() {
        this._pool = new Pool();
    }

    // async getPlaylists(userId) {
    //     const query = {
    //         text: `SELECT playlists.* FROM playlists
    //         LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
    //         WHERE playlists.owner = $1 OR collaborations.user_id = $1
    //         GROUP BY playlists.id`,
    //         values: [userId],
    //     };
    //     const result = await this._pool.query(query);
    //     return result.rows;
    // }

    async getPlaylists(playlistId) {
        const query = {
          text: `SELECT playlists.*, songs.id as song_id, songs.title as song_title, songs.performer FROM playlists
          LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
          LEFT JOIN songs ON songs.id = playlist_songs.song_id
          LEFT JOIN users ON users.id = playlists.owner
          WHERE playlists.id = $1`,
          values: [playlistId],
        };
        const result = await this._pool.query(query);
       
        const songs = result.rows.map((row) => ({
          id: row.song_id,
          title: row.song_title,
          performer: row.performer,
        }));
    
        const playlistResult = {
          id: result.rows[0].id,
          name: result.rows[0].name,
          songs,
        };
    
        return playlistResult;
      }
}

module.exports = PlaylistsService;
