import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';
import Koa from 'koa';
import { ptsqEndpoint, serve } from './ptsq';
import { baseRouter } from './routers';

const app = new Koa();

app.use(async (ctx) => {
  const response = await serve(baseRouter).handleNodeRequestAndResponse(
    ctx.req,
    ctx.res,
  );

  // Set status code
  ctx.status = response.status;

  // Set headers
  for (const [key, value] of response.headers.entries()) {
    ctx.append(key, value);
  }

  ctx.body = response.body
    ? Readable.fromWeb(response.body as ReadableStream<Uint8Array>)
    : undefined;
});

app.listen(4000, () => {
  console.log(`Listening on: http://localhost:4000/${ptsqEndpoint}`);
});

export type BaseRouter = typeof baseRouter;
