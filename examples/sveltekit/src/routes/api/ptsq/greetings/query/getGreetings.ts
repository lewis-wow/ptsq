import { Type } from '@sinclair/typebox';
import { publicResolver } from '../../resolvers/publicResolver';

export const getGreetings = publicResolver
  .output(Type.String())
  .query(() => 'Hello');
