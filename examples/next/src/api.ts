import { createReactClient } from '@ptsq/react-client';
import fetchPonyfill from 'fetch-ponyfill';
import { env } from './env';
import { BaseRouter } from './server/routers';

const { fetch } = fetchPonyfill();

export const api = createReactClient<BaseRouter>({
  url: env.PTSQ_URL,
  fetch: fetch,
});
