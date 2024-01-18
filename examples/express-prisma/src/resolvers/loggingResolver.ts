import { publicResolver } from './publicResolver';

export const loggingResolver = publicResolver.use(async ({ next, meta }) => {
  console.log('request: ', meta);

  const response = await next({
    a: 1,
  });

  console.log('response: ', response);

  return response;
});
