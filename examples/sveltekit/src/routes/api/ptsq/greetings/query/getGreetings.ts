import { Type } from '@ptsq/server';
import { publicResolver } from '../../resolvers/publicResolver';

export const getGreetings = publicResolver
  .output(Type.String())
  .query(() => 'Hello');
