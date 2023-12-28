import { type TSchema } from '@sinclair/typebox';
import { TypeCompiler, type TypeCheck } from '@sinclair/typebox/compiler';
import { Parser } from './parser';

export class Compiler {
  _def: {
    hits: number;
    cache: Map<TSchema, TypeCheck<TSchema>>;
  };

  constructor() {
    this._def = { hits: 0, cache: new Map() };
  }

  get(schema?: TSchema) {
    if (schema === undefined) return undefined;

    if (this._def.cache.has(schema)) {
      this._def.hits++;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this._def.cache.get(schema)!;
    }

    const compiledSchema = TypeCompiler.Compile(schema);

    this._def.cache.set(schema, compiledSchema);
    return compiledSchema;
  }

  getParser<T extends TSchema>(schema?: T) {
    return new Parser({ schema, compiler: this });
  }
}
