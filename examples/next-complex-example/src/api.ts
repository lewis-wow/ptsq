import { createReactClient } from '@ptsq/react-client';
import fetchPonyfill from 'fetch-ponyfill';
import { env } from './env';
import { BaseRouter } from './server/routers';

const { fetch } = fetchPonyfill();

export const api = createReactClient<BaseRouter>({
  url: env.NEXT_PUBLIC_PTSQ_URL,
  fetch: fetch,
});
