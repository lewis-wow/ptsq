import { z } from 'zod';

export type ResolverType = 'query' | 'mutation';

export type NodeType = 'route' | 'router';

export type Route<
  TType extends ResolverType = ResolverType,
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | undefined = z.Schema | undefined,
> = {
  type: TType;
  input: TInput;
  output: TOutput;
  nodeType: 'route';
};

export type RouterNode<
  TType extends ResolverType = ResolverType,
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends z.Schema | undefined = z.Schema | undefined,
> = Route<TType, TInput, TOutput> | Router;

export type Router<
  TRoutes extends { [Key: string]: RouterNode<TType, TInput, TOutput> } = {
    [Key: string]: RouterNode<TType, TInput, TOutput>;
  },
> = {
  nodeType: 'router';
  routes: TRoutes;
};
