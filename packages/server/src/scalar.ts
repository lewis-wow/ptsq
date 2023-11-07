import { HTTPError } from './httpError';
import type { Serializable } from './serializable';
import { z } from 'zod';

export type ScalarParser<TInputSchema extends z.Schema<Serializable>, TOutputSchema extends z.Schema> = {
  value: (arg: z.infer<TInputSchema>) => z.infer<TOutputSchema>;
  schema: TOutputSchema;
};

export type ScalarSerializer<TInputSchema extends z.Schema, TOutputSchema extends z.Schema<Serializable>> = {
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
 *   description: {
 *     input: 'String format of url', // used to describe scalar input for schema
 *     output: 'String format of url', // used to describe scalar output for schema
 *   }
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
  new Scalar<TSerializeSchema, TParseSchema, TDescription>(
    scalarDefinition as {
      parse: ScalarParser<TSerializeSchema, TParseSchema>;
      serialize: ScalarSerializer<TParseSchema, TSerializeSchema>;
      description: TDescription;
    }
  );

export class Scalar<
  TSerializeSchema extends z.Schema<Serializable>,
  TParseSchema extends z.Schema,
  TDescription extends string | undefined,
> {
  protected parse: ScalarParser<TSerializeSchema, TParseSchema>;
  protected serialize: ScalarSerializer<TParseSchema, TSerializeSchema>;

  public description: TDescription;
  public input: z.ZodEffects<TSerializeSchema, z.infer<TParseSchema>, z.input<TSerializeSchema>>;
  public output: z.ZodEffects<TSerializeSchema, z.infer<TSerializeSchema>, z.infer<TParseSchema>>;

  constructor({
    parse,
    serialize,
    description,
  }: {
    parse: ScalarParser<TSerializeSchema, TParseSchema>;
    serialize: ScalarSerializer<TParseSchema, TSerializeSchema>;
    description?: TDescription;
  }) {
    this.parse = parse;
    this.serialize = serialize;
    this.description = description as TDescription;

    this.input = this.serialize.schema.transform((arg) => {
      const transformParseResult = this.parse.schema.safeParse(this.parse.value(arg));

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
      const preprocessParseResult = this.parse.schema.safeParse(arg);
      if (!preprocessParseResult.success)
        throw new HTTPError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Scalar output type is invalid',
          info: preprocessParseResult.error,
        });

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return this.serialize.value(preprocessParseResult.data);
      } catch (error) {
        throw new HTTPError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Scalar output type is invalid',
          info: error,
        });
      }
    }, this.serialize.schema);

    if (this.description) {
      this.input.describe(this.description);
      this.output.describe(this.description);
    }
  }
}
