import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { Resolver } from './resolver';

const query = Resolver.createRoot<{ a: 12 }>()
  .error({ code: 'UNAUTHORIZED' })
  .use(async ({ next, response }) => {
    return response.error({
      code: 'UNAUTHORIZED',
    });

    const res = await next({
      ctx: {
        b: 5 as const,
      },
    });

    return res;
  })
  .output(Type.String())
  .error({ code: 'FORBIDDEN' })
  .query(({ response }) => {
    return response.error({
      code: 'FORBIDDEN',
    });
  });

test('Should create resolver with two arguments validation schemas', () => {
  expect(query.getJsonSchema()).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "_def": {
          "additionalProperties": false,
          "properties": {
            "errorSchema": {
              "anyOf": [
                {
                  "const": "UNAUTHORIZED",
                  "type": "string",
                },
                {
                  "const": "FORBIDDEN",
                  "type": "string",
                },
              ],
            },
            "nodeType": {
              "const": "route",
              "type": "string",
            },
            "outputSchema": {
              "type": "string",
            },
            "type": {
              "const": "query",
              "type": "string",
            },
          },
          "required": [
            "type",
            "nodeType",
            "outputSchema",
            "errorSchema",
          ],
          "type": "object",
        },
      },
      "required": [
        "_def",
      ],
      "type": "object",
    }
  `);
});
/*
test('Should create resolver with two arguments validation schemas', () => {
  const resolver = Resolver.createRoot();

  const resultResolver = resolver
    .args(Type.Object({ a: Type.String() }))
    .args(Type.Object({ b: Type.String() }));

  expect(resultResolver._def.argsSchema).toStrictEqual(
    Type.Intersect([
      Type.Object({ a: Type.String() }),
      Type.Object({ b: Type.String() }),
    ]),
  );
});

test('Should create resolver with output arguments validation schemas', () => {
  const resolver = Resolver.createRoot();

  const resultResolver = resolver
    .output(Type.Object({ a: Type.String() }))
    .output(Type.Object({ b: Type.String() }));

  expect(resultResolver._def.outputSchema).toStrictEqual(
    Type.Intersect([
      Type.Object({ a: Type.String() }),
      Type.Object({ b: Type.String() }),
    ]),
  );
});

test('Should create resolver with description', () => {
  const resolver = Resolver.createRoot<object>();

  const describedResolver = resolver.description('A');

  expect(resolver._def.description).toBe(undefined);
  expect(describedResolver._def.description).toBe('A');
});

test('Should create resolver with arguments', () => {
  const resolver = Resolver.createRoot<object>();

  const intArgsResolver = resolver.args(Type.Integer());

  expect(resolver._def.argsSchema).toBe(undefined);
  expect(intArgsResolver._def.argsSchema).toStrictEqual(Type.Integer());
});

test('Should create resolver with output schema', () => {
  const resolver = Resolver.createRoot<object>();

  const intOutputResolver = resolver.output(Type.Integer());

  expect(resolver._def.outputSchema).toBe(undefined);
  expect(intOutputResolver._def.outputSchema).toStrictEqual(Type.Integer());
});

test('Should merge 2 resolvers', () => {
  const resolverA = Resolver.createRoot<{ a: 1; b: 2 }>();
  const resolverB = Resolver.createRoot<{ a: 1 }>(); // context has to extends { a: 1, b: 2 }

  const mergedResolver = Resolver.merge(resolverA, resolverB);

  expect(mergedResolver).toBeInstanceOf(Resolver);
});

test('Should merge 2 resolvers with args', () => {
  const resolverA = Resolver.createRoot<{ a: 1; b: 2 }>().args(
    Type.Object({
      a: Type.String(),
    }),
  );

  const resolverB = Resolver.createRoot<{ a: 1 }>().args(
    Type.Object({
      b: Type.String(),
    }),
  );

  const mergedResolver = Resolver.merge(resolverA, resolverB);

  expect(mergedResolver._def.argsSchema).toStrictEqual(
    Type.Intersect([
      Type.Object({
        a: Type.String(),
      }),
      Type.Object({
        b: Type.String(),
      }),
    ]),
  );
});

test('Should merge 2 resolvers where first has args and second not', () => {
  const resolverA = Resolver.createRoot<{ a: 1; b: 2 }>().args(
    Type.Object({
      a: Type.String(),
    }),
  );

  const resolverB = Resolver.createRoot<{ a: 1 }>();

  const mergedResolver = Resolver.merge(resolverA, resolverB);

  expect(mergedResolver._def.argsSchema).toStrictEqual(
    Type.Object({
      a: Type.String(),
    }),
  );
});

test('Should merge 2 resolvers where second has args and first not', () => {
  const resolverA = Resolver.createRoot<{ a: 1; b: 2 }>();

  const resolverB = Resolver.createRoot<{ a: 1 }>().args(
    Type.Object({
      a: Type.String(),
    }),
  );

  const mergedResolver = Resolver.merge(resolverA, resolverB);

  expect(mergedResolver._def.argsSchema).toStrictEqual(
    Type.Object({
      a: Type.String(),
    }),
  );
});

test('Should merge 2 resolvers with output schema', () => {
  const resolverA = Resolver.createRoot<{ a: 1; b: 2 }>().output(
    Type.Object({
      a: Type.String(),
    }),
  );

  const resolverB = Resolver.createRoot<{ a: 1 }>().output(
    Type.Object({
      b: Type.String(),
    }),
  );

  const mergedResolver = Resolver.merge(resolverA, resolverB);

  expect(mergedResolver._def.outputSchema).toStrictEqual(
    Type.Intersect([
      Type.Object({
        a: Type.String(),
      }),
      Type.Object({
        b: Type.String(),
      }),
    ]),
  );
});

test('Should merge 2 resolvers where first has output schema and second not', () => {
  const resolverA = Resolver.createRoot<{ a: 1; b: 2 }>().output(
    Type.Object({
      a: Type.String(),
    }),
  );

  const resolverB = Resolver.createRoot<{ a: 1 }>();

  const mergedResolver = Resolver.merge(resolverA, resolverB);

  expect(mergedResolver._def.outputSchema).toStrictEqual(
    Type.Object({
      a: Type.String(),
    }),
  );
});

test('Should merge 2 resolvers where second has output schema and first not', () => {
  const resolverA = Resolver.createRoot<{ a: 1; b: 2 }>();

  const resolverB = Resolver.createRoot<{ a: 1 }>().output(
    Type.Object({
      a: Type.String(),
    }),
  );

  const mergedResolver = Resolver.merge(resolverA, resolverB);

  expect(mergedResolver._def.outputSchema).toStrictEqual(
    Type.Object({
      a: Type.String(),
    }),
  );
});

test('Should merge 2 resolvers with description', () => {
  const resolverA = Resolver.createRoot<{ a: 1; b: 2 }>().description('A');

  const resolverB = Resolver.createRoot<{ a: 1 }>().description('B');

  const mergedResolver = Resolver.merge(resolverA, resolverB);

  expect(mergedResolver._def.description).toBe('B');
});
*/
