import type { SerializableZodSchema } from './serializable';
import { type ZodTypeDef, z } from 'zod';

export class Scalar<
  TParse extends (serialized: string) => any,
  TSerialize extends (deserialized: any) => string,
  TSchema extends SerializableZodSchema,
> {
  protected parse: TParse;
  protected serialize: TSerialize;
  protected schema: TSchema;

  public input: z.ZodEffects<z.ZodType<ReturnType<TParse>, ZodTypeDef, ReturnType<TParse>>, ReturnType<TParse>, string>;
  public output: z.ZodEffects<TSchema, string, z.input<TSchema>>;

  constructor({ parse, serialize, schema }: { parse: TParse; serialize: TSerialize; schema: TSchema }) {
    this.parse = parse;
    this.serialize = serialize;
    this.schema = schema;

    this.input = z
      .custom<ReturnType<TParse>>((data) => this.parse(String(data)) as ReturnType<TParse>)
      .transform((data) => this.parse(data));

    this.output = this.schema.transform((arg) => this.serialize(arg));
  }
}
