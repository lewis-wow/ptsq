import { Type } from '@sinclair/typebox';

/**
 * @internal
 *
 * validation schema for validating POST request body
 */
export const requestBodySchema = Type.Object(
  {
    route: Type.RegExp(/^[a-zA-Z]+(\.[a-zA-Z]+)*$/),
    type: Type.Union([Type.Literal('query'), Type.Literal('mutation')]),
    input: Type.Optional(Type.Unknown()),
  },
  {
    additionalProperties: false,
  },
);
