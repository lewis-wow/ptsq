import { createReactClient } from '@ptsq/react-client';
import fetchPonyfill from 'fetch-ponyfill';
import { BaseRouter } from './server/routers';

const { fetch } = fetchPonyfill();

export const api = createReactClient<BaseRouter>({
  url: 'http://localhost:3000/api/ptsq',
  fetch: fetch,
});
