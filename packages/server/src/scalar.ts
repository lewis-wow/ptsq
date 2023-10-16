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

export class Scalar<
  TSerializeSchema extends z.Schema<Serializable>,
  TParseSchema extends z.Schema,
  TDescription extends
    | {
        input?: string;
        output?: string;
      }
    | undefined,
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

    this.input = this.serialize.schema
      .transform((arg) => this.parse.schema.parse(this.parse.value(arg)))
      .describe(this.description?.input ?? '');

    this.output = z
      .preprocess((arg) => this.serialize.value(this.parse.schema.parse(arg)), this.serialize.schema)
      .describe(this.description?.output ?? '');
  }
}
