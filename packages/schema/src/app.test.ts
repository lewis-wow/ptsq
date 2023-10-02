import { expectTypeOf, test } from 'vitest';
import { app } from './app';
import { DataTransformer, defaultDataTransformer } from './transformer';
import superjson from 'superjson';

test('Should create app without transformer', () => {
  const { transformer } = app();

  expectTypeOf(transformer).toMatchTypeOf(defaultDataTransformer);
});

test('Should create app without transformer with empty query', () => {
  const { router, query } = app();

  const baseRouter = router({
    test: query(),
  });

  expectTypeOf(baseRouter).toMatchTypeOf(
    router({
      test: query(),
    })
  );
});

test('Should create app with superjson transformer', () => {
  const { transformer } = app({
    transformer: superjson,
  });

  expectTypeOf(transformer).toMatchTypeOf<typeof superjson>();
  expectTypeOf(transformer).toMatchTypeOf<DataTransformer>();
});

test('Should create app with superjson transformer with empty query', () => {
  const { router, query } = app({
    transformer: superjson,
  });

  const baseRouter = router({
    test: query(),
  });

  expectTypeOf(baseRouter).toMatchTypeOf(
    router({
      test: query(),
    })
  );
});
