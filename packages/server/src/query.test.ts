import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { z } from 'zod';

test('Should create query', async () => {
  const { resolver } = createServer({
    ctx: () => ({
      greetingsPrefix: 'Hello' as const,
    }),
  });

  const validationSchema = z.string();
  const resolveFunction = ({ input, ctx }: { input: string; ctx: { greetingsPrefix: 'Hello' } }) =>
    `${ctx.greetingsPrefix} ${input}`;

  const query = resolver.query({
    input: validationSchema,
    output: validationSchema,
    resolve: resolveFunction,
  });

  expect(query.nodeType).toBe('route');
  expect(query.type).toBe('query');
  expect(query.middlewares).toStrictEqual([]);
  expect(query.inputValidationSchema).toBe(validationSchema);
  expect(query.outputValidationSchema).toBe(validationSchema);
  expect(query.resolveFunction).toBe(resolveFunction);
  expect(
    await query.call({ meta: { input: 'John', route: 'dummy.route' }, ctx: { greetingsPrefix: 'Hello' as const } })
  ).toStrictEqual({
    data: 'Hello John',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });
  /*expect(await query.createServerSideQuery({ greetingsPrefix: 'Hello' as const }).query('John')).toBe({
    data: 'Hello John',
    ok: true,
    ctx: {
      greetingsPrefix: 'Hello',
    },
  });*/
  expect(query.getJsonSchema('test')).toMatchInlineSnapshot(`
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
            "query",
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
