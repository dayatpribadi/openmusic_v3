const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../except/NotFoundError');
const InvariantError = require('../../except/InvariantError');

class ActivityService {
    constructor() {
        this._pool = new Pool();
    }

    async addActivity(playlistId, userId, songId, action) {
        const id = `activity-${nanoid(16)}`;
        const time = new Date().toISOString();
        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
            values: [id, playlistId, songId, userId, action, time],
        };

        await this._pool.query(query);
    }

    async deleteActivity(playlistId) {
      const query = {
        text: 'DELETE FROM playlist_song_activities WHERE playlist_id = $1 RETURNING id',
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new InvariantError('Activity gagal dihapus');
      }
    }

    async getActivities(playlistId) {
        const query1 = {
          text: `SELECT playlist_id FROM playlist_song_activities
          WHERE playlist_id = $1 GROUP BY playlist_id`,
          values: [playlistId],
        };

        const query2 = {
          text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time 
          FROM ((playlist_song_activities 
            INNER JOIN users on users.id = playlist_song_activities.user_id)
            INNER JOIN songs on songs.id = playlist_song_activities.song_id) 
            WHERE playlist_song_activities.playlist_id = $1`,
          values: [playlistId],
        };

        const result = await this._pool.query(query1);

        const activities = await this._pool.query(query2);

        const combine = {
          playlistId: result.rows[0].playlist_id,
          activities: [...activities.rows],
        };

        if (!result.rows.length) {
          throw new NotFoundError('Playlist not found');
        }

        return combine;
      }
}

module.exports = ActivityService;
