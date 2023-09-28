import { z } from 'zod';

export type ResolverType = 'query' | 'mutation';

export type Route<
  TType extends ResolverType = ResolverType,
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | undefined = z.Schema | undefined,
> = {
  type: TType;
  input: TInput;
  output: TOutput;
};

export type Router<
  TType extends ResolverType = ResolverType,
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | undefined = z.Schema | undefined,
> = { [Key: string]: Route<TType, TInput, TOutput> | Router };
