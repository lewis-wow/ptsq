import type { Context } from './context';
import type { ResolverRequest } from './resolver';
import type {
  AnyTransformer,
  inferTransformerResult,
  Transformer,
} from './transformer';
import type { MaybePromise } from './types';

export type Transformation<TArgs, TContext extends Context, TNextArgs> =
  | ArgsTransformationFunction<TArgs, TContext, TNextArgs>
  | ArgsTransformationObject<TArgs>;

export type ArgsTransformationFunction<
  TArgs = unknown,
  TContext extends Context = Context,
  TNextArgs = MaybePromise<unknown>,
> = (options: {
  input: TArgs;
  meta: ResolverRequest;
  ctx: TContext;
}) => MaybePromise<TNextArgs>;

export type ArgsTransformationObject<TArgs> = TArgs extends object
  ?
      | {
          [K in keyof TArgs]?: ArgsTransformationObject<TArgs[K]>;
        }
      | Transformer<(input: TArgs) => any>
  : Transformer<(input: TArgs) => any>;

export type ArgsTransformerResult<
  TArgs,
  TArgsTransformationObject extends ArgsTransformationObject<TArgs>,
> = TArgsTransformationObject extends AnyTransformer
  ? inferTransformerResult<TArgsTransformationObject>
  : TArgsTransformationObject extends object
  ? {
      [K in keyof TArgsTransformationObject]: K extends keyof TArgs
        ? TArgsTransformationObject[K] extends ArgsTransformationObject<
            TArgs[K]
          >
          ? ArgsTransformerResult<TArgs[K], TArgsTransformationObject[K]>
          : never
        : never;
    }
  : TArgs;

export type inferArgsTransformationNextArgs<
  TArgs,
  TContext extends Context,
  TTransformation extends Transformation<TArgs, TContext, any>,
> = TTransformation extends ArgsTransformationFunction<TArgs, TContext, any>
  ? Awaited<ReturnType<TTransformation>>
  : TTransformation extends ArgsTransformationObject<TArgs>
  ? ArgsTransformerResult<TArgs, TTransformation>
  : never;
