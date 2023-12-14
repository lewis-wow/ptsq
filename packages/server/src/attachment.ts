import type { AnyMiddleware } from './middleware';
import type {
  AnyResolveFunction,
  ResolverSchemaArgs,
  ResolverSchemaOutput,
} from './resolver';
import { Route } from './route';
import type { AnyTransformation } from './transformation';

export type AttachmentResolveOptions<
  TResolveFunction extends AnyResolveFunction,
> = {
  fileSize?: number;
  files?: number;
  fieldSize?: number;
  headerSize?: number;
  resolve: TResolveFunction;
};

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
    resolveOptions: AttachmentResolveOptions<TResolveFunction>;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    description: TDescription;
  }) {
    // TODO: CREATE VALIDATION FOR RESOLVE FUNCTION BASED ON OPTIONS!!!!

    super({
      type: 'attachment',
      resolveFunction: options.resolveOptions.resolve,
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
