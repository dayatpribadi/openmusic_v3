/* eslint-disable camelcase */

const mapAlbumsDB = ({
  id,
  name,
  year,
  cover,
  songs,
}) => ({
  id,
  name,
  year,
  cover,
  songs,
});

const mapSongDB = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

const mapDBToAlbumSongService = ({
  id,
  name,
  year,
  cover,
}, song) => ({
  id,
  name,
  year,
  coverUrl: cover,
  songs: song,
});

const mapDBToPlaylistSong = ({
  id,
  name,
  username,
}) => ({
  id, name, username,
});

const mapDBToPlalistActivity = (playlistId, activities) => ({
  playlistId,
  activities,
});

const filterTitleSongByParam = (song, title) => (song.title.toLowerCase().includes(title));
const filterPerformerSongByParam = (song, performer) => (song.performer.toLowerCase().includes(performer));
module.exports = {
  mapAlbumsDB,
  mapSongDB,
  mapDBToPlaylistSong,
  mapDBToAlbumSongService,
  mapDBToPlalistActivity,
  filterPerformerSongByParam,
  filterTitleSongByParam,
};
