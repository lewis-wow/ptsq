import { z } from 'zod';
import { HTTPError } from './httpError';
import type { Serializable } from './serializable';

export type ScalarParser<
  TInputSchema extends z.Schema<Serializable>,
  TOutputSchema extends z.Schema,
> = {
  value: (arg: z.infer<TInputSchema>) => z.infer<TOutputSchema>;
  schema: TOutputSchema;
};

export type ScalarSerializer<
  TInputSchema extends z.Schema,
  TOutputSchema extends z.Schema<Serializable>,
> = {
  value: (arg: z.infer<TInputSchema>) => z.infer<TOutputSchema>;
  schema: TOutputSchema;
};

/**
 * Creates a scalar type with custom parsing and serialization
 *
 * Description is generic written only for you can see the description on the server in IDE
 *
 * @example
 * ```ts
 * const URLScalar = scalar({
 *   parse: {
 *     schema: z.instanceof(URL), // used to validate parsed value
 *     value: (arg) => new URL(arg),
 *   },
 *   serialize: {
 *     schema: z.string().url(), // used to validate requst and response
 *     value: (arg) => arg.toString(),
 *   },
 *   description: 'String format of url', // used to describe scalar input for schema
 * });
 * ```
 */
export const scalar = <
  TSerializeSchema extends z.Schema<Serializable>,
  TParseSchema extends z.Schema,
  TDescription extends string | undefined,
>(scalarDefinition: {
  parse: ScalarParser<TSerializeSchema, TParseSchema>;
  serialize: ScalarSerializer<TParseSchema, TSerializeSchema>;
  description?: TDescription;
}) =>
  new Scalar<TSerializeSchema, TParseSchema, TDescription>(scalarDefinition);

export class Scalar<
  TSerializeSchema extends z.Schema<Serializable> = z.Schema<Serializable>,
  TParseSchema extends z.Schema = z.Schema,
  TDescription extends string | undefined = string | undefined,
> {
  _parse: ScalarParser<TSerializeSchema, TParseSchema>;
  _serialize: ScalarSerializer<TParseSchema, TSerializeSchema>;

  description: TDescription;
  input: z.ZodEffects<
    TSerializeSchema,
    z.infer<TParseSchema>,
    z.input<TSerializeSchema>
  >;
  output: z.ZodEffects<
    TSerializeSchema,
    z.infer<TSerializeSchema>,
    z.infer<TParseSchema>
  >;

  constructor(options: {
    parse: ScalarParser<TSerializeSchema, TParseSchema>;
    serialize: ScalarSerializer<TParseSchema, TSerializeSchema>;
    description?: TDescription;
  }) {
    this._parse = options.parse;
    this._serialize = options.serialize;
    this.description = options.description as TDescription;

    this.input = this._serialize.schema.transform((arg) => {
      const transformParseResult = this._parse.schema.safeParse(
        this._parse.value(arg),
      );

      if (!transformParseResult.success)
        throw new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Scalar input type is invalid',
          info: transformParseResult.error,
        });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return transformParseResult.data;
    });

    this.output = z.preprocess((arg) => {
      const preprocessParseResult = this._parse.schema.safeParse(arg);
      if (!preprocessParseResult.success)
        throw new HTTPError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Scalar output type is invalid',
          info: preprocessParseResult.error,
        });

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return this._serialize.value(preprocessParseResult.data);
      } catch (error) {
        throw new HTTPError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Scalar output type is invalid',
          info: error,
        });
      }
    }, this._serialize.schema);

    if (this.description) {
      this.input.describe(this.description);
      this.output.describe(this.description);
    }
  }

  serialize(value: z.infer<TParseSchema>): z.infer<TSerializeSchema> {
    return this.output.parse(value);
  }

  parse(value: z.infer<TSerializeSchema>): z.infer<TParseSchema> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.input.parse(value);
  }
}
