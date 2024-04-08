import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { Resolver } from './resolver';

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
