import { z } from 'zod';
import { Route } from './route';

export function mutation(): Route<'mutation', undefined, any>;
export function mutation<TMutationOutput extends z.Schema | any = any>({
  input,
  output,
}: {
  input?: undefined;
  output?: TMutationOutput;
}): Route<'mutation', undefined, TMutationOutput>;
export function mutation<
  TMutationInput extends z.Schema | undefined = undefined,
  TMutationOutput extends z.Schema | any = any,
>(options: { input?: TMutationInput; output?: TMutationOutput }): Route<'mutation', TMutationInput, TMutationOutput>;
export function mutation<
  TMutationInput extends z.Schema | undefined = undefined,
  TMutationOutput extends z.Schema | any = any,
>(options?: { input?: TMutationInput; output?: TMutationOutput }): Route<'mutation', TMutationInput, TMutationOutput> {
  return {
    input: options?.input as TMutationInput,
    output: options?.output as TMutationOutput,
    type: 'mutation',
    nodeType: 'route',
  };
}
