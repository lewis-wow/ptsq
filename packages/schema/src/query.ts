import { z } from 'zod';
import { Route } from './route';

export function query(): Route<'query', undefined, any>;
export function query<
  TQueryInput extends z.Schema | undefined = undefined,
  TQueryOutput extends z.Schema | any = any,
>(options: { input?: TQueryInput; output?: TQueryOutput }): Route<'query', TQueryInput, TQueryOutput>;
export function query<
  TQueryInput extends z.Schema | undefined = undefined,
  TQueryOutput extends z.Schema | any = any,
>(options?: { input?: TQueryInput; output?: TQueryOutput }): Route<'query', TQueryInput, TQueryOutput> {
  return {
    input: options?.input as TQueryInput,
    output: options?.output as TQueryOutput,
    type: 'query',
    nodeType: 'route',
  };
}
