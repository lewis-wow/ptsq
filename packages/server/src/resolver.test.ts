import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { Resolver } from './resolver';

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

test('Should merge 2 resolvers with description', () => {
  const resolverA = Resolver.createRoot<{ a: 1; b: 2 }>().description('A');

  const resolverB = Resolver.createRoot<{ a: 1 }>().description('B');

  const mergedResolver = Resolver.merge(resolverA, resolverB);

  expect(mergedResolver._def.description).toBe('B');
});
