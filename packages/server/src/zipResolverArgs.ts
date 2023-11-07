import type { ResolverArgs } from './resolver';

export type ZipResolverArgsPayload<TResolverArgs extends ResolverArgs, UResolverArgs extends ResolverArgs> = {
  key: keyof TResolverArgs | keyof UResolverArgs;
  value: [TResolverArgs[keyof TResolverArgs] | undefined, UResolverArgs[keyof UResolverArgs] | undefined];
}[];

export const zipResolverArgs = <TResolverArgs extends ResolverArgs, UResolverArgs extends ResolverArgs>(
  a: TResolverArgs,
  b: UResolverArgs
): ZipResolverArgsPayload<TResolverArgs, UResolverArgs> => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const uniqueKeys = Array.from(new Set([...aKeys, ...bKeys]));

  return uniqueKeys.map((key) => ({
    key,
    value: [a[key], b[key]] as [
      TResolverArgs[keyof TResolverArgs] | undefined,
      UResolverArgs[keyof UResolverArgs] | undefined,
    ],
  }));
};
