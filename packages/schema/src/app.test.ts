import { expectTypeOf, test } from 'vitest';
import { app } from './app';
import { DataTransformer, defaultDataTransformer } from './transformer';
import superjson from 'superjson';
import { z } from 'zod';

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

  expectTypeOf(baseRouter.routes.test.input).toMatchTypeOf(undefined);
  expectTypeOf(baseRouter.routes.test.output).toMatchTypeOf<any>();
  expectTypeOf(baseRouter.routes.test.dataTransformer).toMatchTypeOf(defaultDataTransformer);
  expectTypeOf(baseRouter.routes.test.nodeType).toMatchTypeOf<'route'>();
  expectTypeOf(baseRouter.routes.test.type).toMatchTypeOf<'query'>();
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

  expectTypeOf(baseRouter.routes.test.input).toMatchTypeOf(undefined);
  expectTypeOf(baseRouter.routes.test.output).toMatchTypeOf<any>();
  expectTypeOf(baseRouter.routes.test.dataTransformer).toMatchTypeOf(superjson);
  expectTypeOf(baseRouter.routes.test.nodeType).toMatchTypeOf<'route'>();
  expectTypeOf(baseRouter.routes.test.type).toMatchTypeOf<'query'>();
});

test('Should create app without transformer with query', () => {
  const { router, query } = app();

  const baseRouter = router({
    test: query({
      input: z.object({ name: z.string(), email: z.string().email() }),
      output: z.object({ id: z.string() }),
    }),
  });

  expectTypeOf(baseRouter).toMatchTypeOf(
    router({
      test: query({
        input: z.object({ name: z.string(), email: z.string().email() }),
        output: z.object({ id: z.string() }),
      }),
    })
  );

  expectTypeOf(baseRouter.routes.test.input).toMatchTypeOf(z.object({ name: z.string(), email: z.string().email() }));
  expectTypeOf(baseRouter.routes.test.output).toMatchTypeOf(z.object({ id: z.string() }));
  expectTypeOf(baseRouter.routes.test.dataTransformer).toMatchTypeOf(defaultDataTransformer);
  expectTypeOf(baseRouter.routes.test.nodeType).toMatchTypeOf<'route'>();
  expectTypeOf(baseRouter.routes.test.type).toMatchTypeOf<'query'>();
});

test('Should create app without transformer with mutation', () => {
  const { router, mutation } = app();

  const baseRouter = router({
    test: mutation({
      input: z.object({ name: z.string(), email: z.string().email() }),
      output: z.object({ id: z.string() }),
    }),
  });

  expectTypeOf(baseRouter).toMatchTypeOf(
    router({
      test: mutation({
        input: z.object({ name: z.string(), email: z.string().email() }),
        output: z.object({ id: z.string() }),
      }),
    })
  );

  expectTypeOf(baseRouter.routes.test.input).toMatchTypeOf(z.object({ name: z.string(), email: z.string().email() }));
  expectTypeOf(baseRouter.routes.test.output).toMatchTypeOf(z.object({ id: z.string() }));
  expectTypeOf(baseRouter.routes.test.dataTransformer).toMatchTypeOf(defaultDataTransformer);
  expectTypeOf(baseRouter.routes.test.nodeType).toMatchTypeOf<'route'>();
  expectTypeOf(baseRouter.routes.test.type).toMatchTypeOf<'mutation'>();
});

test('Should create app without transformer with router in router with query', () => {
  const { router, query } = app();

  const testRouter = router({
    test: query({
      input: z.object({ name: z.string(), email: z.string().email() }),
      output: z.object({ id: z.string() }),
    }),
  });

  const baseRouter = router({
    testRouter,
  });

  expectTypeOf(baseRouter).toMatchTypeOf(
    router({
      testRouter: router({
        test: query({
          input: z.object({ name: z.string(), email: z.string().email() }),
          output: z.object({ id: z.string() }),
        }),
      }),
    })
  );

  expectTypeOf(baseRouter.routes.testRouter.routes.test.input).toMatchTypeOf(
    z.object({ name: z.string(), email: z.string().email() })
  );
  expectTypeOf(baseRouter.routes.testRouter.routes.test.output).toMatchTypeOf(z.object({ id: z.string() }));
  expectTypeOf(baseRouter.routes.testRouter.routes.test.dataTransformer).toMatchTypeOf(defaultDataTransformer);
  expectTypeOf(baseRouter.routes.testRouter.routes.test.nodeType).toMatchTypeOf<'route'>();
  expectTypeOf(baseRouter.routes.testRouter.routes.test.type).toMatchTypeOf<'query'>();
});

test('Should create app without transformer with router in router with mutation', () => {
  const { router, mutation } = app();

  const testRouter = router({
    test: mutation({
      input: z.object({ name: z.string(), email: z.string().email() }),
      output: z.object({ id: z.string() }),
    }),
  });

  const baseRouter = router({
    testRouter,
  });

  expectTypeOf(baseRouter).toMatchTypeOf(
    router({
      testRouter: router({
        test: mutation({
          input: z.object({ name: z.string(), email: z.string().email() }),
          output: z.object({ id: z.string() }),
        }),
      }),
    })
  );

  expectTypeOf(baseRouter.routes.testRouter.routes.test.input).toMatchTypeOf(
    z.object({ name: z.string(), email: z.string().email() })
  );
  expectTypeOf(baseRouter.routes.testRouter.routes.test.output).toMatchTypeOf(z.object({ id: z.string() }));
  expectTypeOf(baseRouter.routes.testRouter.routes.test.dataTransformer).toMatchTypeOf(defaultDataTransformer);
  expectTypeOf(baseRouter.routes.testRouter.routes.test.nodeType).toMatchTypeOf<'route'>();
  expectTypeOf(baseRouter.routes.testRouter.routes.test.type).toMatchTypeOf<'mutation'>();
});
