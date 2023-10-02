import { DataTransformer, defaultDataTransformer } from './transformer';
import { CreateQuery, queryDefinition } from './queryDefinition';
import { CreateMutation, mutationDefinition } from './mutationDefinition';
import { CreateRouter, routerDefinition } from './routerDefinition';

type AppArgs<TTransfromer extends DataTransformer> = {
  transformer?: TTransfromer;
};

export type App<TTransfromer extends DataTransformer = DataTransformer> = {
  query: CreateQuery<TTransfromer>;
  mutation: CreateMutation<TTransfromer>;
  router: CreateRouter<TTransfromer>;
  type: <TType>() => TType;
  transformer: TTransfromer;
};

export const app = <TTransfromer extends DataTransformer = DataTransformer>(
  args?: AppArgs<TTransfromer>
): App<TTransfromer> => {
  const { transformer } = args ?? {};

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
    type: <TType>() => undefined as unknown as TType,
  };
};
