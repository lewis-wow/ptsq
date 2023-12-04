import { resolver } from '../ptsq';

export const loggingResolver = resolver.use(async ({ ctx, meta, next }) => {
  console.time('Logging');

  console.log('The input is: ', meta.input);
  console.log('The route is: ', meta.route);

  const response = await next(ctx);

  console.timeEnd('Logging');

  console.log('The output is: ', response.ok ? response.data : response.error);

  return response;
});
