import { type TSchema } from '@sinclair/typebox';
import { TypeCompiler, type TypeCheck } from '@sinclair/typebox/compiler';
import { Parser } from './parser';

export class Compiler {
  _def: {
    cache: Map<TSchema, TypeCheck<TSchema>>;
  };

  constructor() {
    this._def = { cache: new Map() };
  }

  get(schema?: TSchema) {
    if (schema === undefined) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this._def.cache.has(schema)) return this._def.cache.get(schema)!;

    const compiledSchema = TypeCompiler.Compile(schema);

    this._def.cache.set(schema, compiledSchema);
    return compiledSchema;
  }

  getParser<T extends TSchema>(schema?: T) {
    return new Parser({ schema, compiler: this });
  }
}
