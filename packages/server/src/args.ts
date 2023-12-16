import type { Static, TAnySchema } from '@sinclair/typebox';
import { Value, type ValueError } from '@sinclair/typebox/value';

export type SafeParseArgsPayload<T extends TAnySchema> =
  | {
      ok: true;
      data: Static<T>;
    }
  | {
      ok: false;
      errors: ValueError[];
    };

export const safeParseArgs = <T extends TAnySchema>({
  schema,
  value,
}: {
  schema?: T;
  value: unknown;
}): SafeParseArgsPayload<T> => {
  if (!schema)
    return {
      ok: true,
      data: value,
    };

  if (Value.Check(schema, value))
    return {
      ok: true,
      data: value,
    };

  const errors = [...Value.Errors(schema, value)];

  return {
    ok: false,
    errors,
  };
};
