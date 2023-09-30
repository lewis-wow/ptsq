import { DataTransformer, defaultDataTransformer } from './transformer';
import { Router } from './router';

export type AppArgs<TRouter extends Router, TTransfromer extends DataTransformer> = {
  transformer?: TTransfromer;
  router: TRouter;
};

export type App<TRouter extends Router = Router, TTransfromer extends DataTransformer = DataTransformer> = {
  transformer: TTransfromer;
  router: TRouter;
};

export const app = <TRouter extends Router, TTransfromer extends DataTransformer = DataTransformer>(
  args: AppArgs<TRouter, TTransfromer>
): App<TRouter, TTransfromer> => {
  const { transformer, router } = args;

  return {
    router,
    transformer: transformer ?? (defaultDataTransformer as TTransfromer),
  };
};
