import { expect, test } from 'vitest';
import { numberArg } from './number';
import { objectArg } from './object';
import { stringArg } from './string';

test('test', () => {
  const schema = objectArg({
    name: stringArg(),
    age: numberArg(),
  });

  expect(schema.getJSONSchema()).toMatchInlineSnapshot(`
    {
      "additionalProperties": false,
      "properties": {
        "age": {
          "type": "number",
        },
        "name": {
          "type": "string",
        },
      },
      "type": "object",
    }
  `);
});
