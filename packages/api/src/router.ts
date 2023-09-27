import { z } from 'zod';
import { HTTPErrorCode } from 'error';

export type Route<
  TType extends 'query' | 'mutation' = 'query' | 'mutation',
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends Partial<Record<keyof HTTPErrorCode | 'SUCCESS', z.Schema>> | undefined =
    | Partial<Record<keyof HTTPErrorCode | 'SUCCESS', z.Schema>>
    | undefined,
> = {
  type: TType;
  input: TInput;
  output: TOutput;
};

type Router<
  TType extends 'query' | 'mutation' = 'query' | 'mutation',
  TInput extends z.Schema | undefined = z.Schema | undefined,
  TOutput extends Partial<Record<keyof HTTPErrorCode | 'SUCCESS', z.Schema>> | undefined =
    | Partial<Record<keyof HTTPErrorCode | 'SUCCESS', z.Schema>>
    | undefined,
> = { [Key: string]: Route<TType, TInput, TOutput> | Router };

export const router = <
  TType extends 'query' | 'mutation',
  TInput extends z.Schema | undefined,
  TOutput extends Partial<Record<keyof HTTPErrorCode | 'SUCCESS', z.Schema>> | undefined,
  TRoutes extends Router<TType, TInput, TOutput>,
>(
  routes: TRoutes
) => routes;
