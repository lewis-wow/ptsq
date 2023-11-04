import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { z } from 'zod';

test('Should create mutation', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

  const validationSchema = z.string();
  const resolveFunction = ({ input, ctx }: { input: string; ctx: { greetingsPrefix: 'Hello' } }) =>
    `${ctx.greetingsPrefix} ${input}`;

  const mutation = resolver.mutation({
    input: validationSchema,
    output: validationSchema,
    resolve: resolveFunction,
  });

  expect(mutation.nodeType).toBe('route');
  expect(mutation.type).toBe('mutation');
  expect(mutation.middlewares).toStrictEqual([]);
  expect(mutation.inputValidationSchema).toBe(validationSchema);
  expect(mutation.outputValidationSchema).toBe(validationSchema);
  expect(mutation.resolveFunction).toBe(resolveFunction);
  expect(
    await mutation.call({ meta: { input: 'John', route: 'dummy.route' }, ctx: { greetingsPrefix: 'Hello' as const } })
  ).toStrictEqual({
    data: 'Hello John',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });
  /*expect(await mutation.createServerSideMutation({ greetingsPrefix: 'Hello' as const }).mutate('John')).toStrictEqual({
    data: 'Hello John',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });*/
  expect(mutation.getJsonSchema('test')).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "inputValidationSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "string",
        },
        "nodeType": {
          "enum": [
            "route",
          ],
          "type": "string",
        },
        "outputValidationSchema": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "type": "string",
        },
        "type": {
          "enum": [
            "mutation",
          ],
          "type": "string",
        },
      },
      "required": [
        "type",
        "nodeType",
        "inputValidationSchema",
        "outputValidationSchema",
      ],
      "title": "TestRoute",
      "type": "object",
    }
  `);
});
