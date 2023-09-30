import { expectTypeOf, test } from 'vitest';
import { app } from './app';
import { DataTransformer } from './transformer';
import superjson from 'superjson';
import { router } from './router';
import { z } from 'zod';
import { query } from './query';

test('Should create app without transformer', () => {
  const { transformer } = app({
    router: router({}),
  });

  expectTypeOf(transformer).toMatchTypeOf<DataTransformer>();
});

test('Should create app without transformer with empty query', () => {
  const { router: baseRouter } = app({
    router: router({
      test: query(),
    }),
  });

  const routerTest = router({
    test: query(),
  });

  expectTypeOf(baseRouter).toMatchTypeOf(routerTest);
});

test('Should create app with superjson transformer', () => {
  const { transformer } = app({
    transformer: superjson,
    router: router({
      a: query({
        input: z.object({ id: z.string() }),
      }),
    }),
  });

  expectTypeOf(transformer).toMatchTypeOf<typeof superjson>();
  expectTypeOf(transformer).toMatchTypeOf<DataTransformer>();
});
