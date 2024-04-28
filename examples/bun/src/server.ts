import { ptsqEndpoint, serve } from './ptsq';
import { baseRouter } from './routers';

Bun.serve({
  fetch: (request) => {
    const response = serve(baseRouter).fetch(request);

    return response;
  },
  port: 4000,
});

console.log(`Listening on: http://localhost:4000/${ptsqEndpoint}`);

export type BaseRouter = typeof baseRouter;
