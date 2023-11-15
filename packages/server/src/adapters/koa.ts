import type Koa from 'koa';

export type KoaAdapterContext = {
  req: Koa.Request;
  res: Koa.Response;
};
