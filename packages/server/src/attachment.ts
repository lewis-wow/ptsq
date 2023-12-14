import type { AnyMiddleware } from './middleware';
import type {
  AnyResolveFunction,
  ResolverSchemaArgs,
  ResolverSchemaOutput,
} from './resolver';
import { Route } from './route';
import type { AnyTransformation } from './transformation';

/**
 * @internal
 *
 * Attachment class container
 */
export class Attachment<
  TSchemaArgs extends ResolverSchemaArgs | undefined,
  TSchemaOutput extends ResolverSchemaOutput,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<
  'attachment',
  TSchemaArgs,
  TSchemaOutput,
  TResolveFunction,
  TDescription
> {
  constructor(options: {
    schemaArgs: TSchemaArgs;
    schemaOutput: TSchemaOutput;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    description: TDescription;
  }) {
    super({
      type: 'attachment',
      ...options,
    });
  }
}

export type AnyAttachment = Attachment<
  ResolverSchemaArgs | undefined,
  ResolverSchemaOutput,
  AnyResolveFunction,
  string | undefined
>;
