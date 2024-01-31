import { createReactClient } from '@ptsq/react-client';
import { BaseRouter } from './pages/api/[...ptsq]';

export const ptsq = createReactClient<BaseRouter>({
  url: 'http://localhost:3000/api/ptsq',
});
