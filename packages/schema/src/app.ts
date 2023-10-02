import { DataTransformer, defaultDataTransformer } from './transformer';
import { queryDefinition } from './queryDefinition';
import superjson from 'superjson';
import { mutationDefinition } from './mutationDefinition';
import { routerDefinition } from './routerDefinition';
import { z } from 'zod';

export type AppArgs<TTransfromer extends DataTransformer> = {
  transformer?: TTransfromer;
};

export const app = <TTransfromer extends DataTransformer = DataTransformer>(args: AppArgs<TTransfromer>) => {
  const { transformer } = args;

  const query = queryDefinition({
    dataTransformer: transformer ?? (defaultDataTransformer as TTransfromer),
  });

  const mutation = mutationDefinition({
    dataTransformer: transformer ?? (defaultDataTransformer as TTransfromer),
  });

  const router = routerDefinition({
    dataTransformer: transformer ?? (defaultDataTransformer as TTransfromer),
  });

  return {
    transformer: transformer ?? (defaultDataTransformer as TTransfromer),
    query,
    mutation,
    router,
  };
};

const { query, mutation, router } = app({
  transformer: superjson,
});

const baseRouter = router({
  a: router({
    b: query(),
  }),
  c: mutation({
    input: z.object({ name: z.string() }),
  }),
});
