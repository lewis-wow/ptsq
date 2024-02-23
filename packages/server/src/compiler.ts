import { type TSchema } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

/**
 * Creates a Typebox validation schema compiler with cache per schema instance
 *
 * You can extends this class to add a cache layer
 */
export class Compiler {
  compile<T extends TSchema>(schema: T) {
    return TypeCompiler.Compile(schema);
  }
}
