import type { Server } from 'http';
import type { Socket } from 'net';

export const killable = (server: Server) => {
  let sockets: Socket[] = [];

  server.on('connection', function (socket) {
    sockets.push(socket);

    socket.once('close', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });
  });

  return {
    server,
    kill: (callback?: () => void) => {
      server.close(callback);
      sockets.forEach(function (socket) {
        socket.destroy();
      });

      sockets = [];
    },
  };
};
