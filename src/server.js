// IMPORT AND CONFIG .dotenvs
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const ClientError = require('./except/ClientError');

// AUTH CONFIG
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// USER CONFIG
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// ALBUM CONFIG
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// SONG CONFIG
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// PLAYLIST CONFIG
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// PLAYLISTSONGS
const playlistsSongs = require('./api/playlistsongs');
const PlaylistsongsService = require('./services/postgres/PlaylistsongsService');
const PlaylistsongsValidator = require('./validator/playlistsongs');

// COLLABORATE
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationValidator = require('./validator/collaborations');

// EXPORT
const _exports = require('./api/exports');
const ProducerService = require('./services/postgres/ProducerService');
const ExportsValidator = require('./validator/exports');

// UPLOADS
const uploads = require('./api/uploads');
const UploadsValidator = require('./validator/uploads');
const StorageService = require('./services/postgres/StorageService');

// Activity
const activity = require('./api/activities');
const ActivityService = require('./services/postgres/ActivityService');

// CACHE
const CacheService = require('./services/postgres/CacheService');

// ALBUMLIKES
const albumLikes = require('./api/albumLikes');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');

/* eslint no-use-before-define: "error" */
const init = async () => {
  const cacheService = new CacheService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const songsService = new SongsService();
  const playlistsongsService = new PlaylistsongsService();
  const activityService = new ActivityService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService, cacheService);
  const authenticationsService = new AuthenticationsService();
  const uploadServices = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  const albumLikesService = new AlbumLikesService(cacheService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
        plugin: Jwt,
    },
    {
      plugin: Inert,
  },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        usersService,
        cacheService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistsSongs,
      options: {
        service: playlistsongsService,
        playlistsService,
        validator: PlaylistsongsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },

    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        playlistsService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService,
      },
    },
    {
      plugin: uploads,
      options: {
        service: uploadServices,
        albumsService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: albumLikes,
      options: {
        service: albumLikesService,
        albumsService,
      },
    },
    {
      plugin: activity,
      options: {
        activityService,
        playlistsService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
  }

  return h.continue;
});

  await server.start();
  console.log(`The server is running on ${server.info.uri}`);
};

init();
