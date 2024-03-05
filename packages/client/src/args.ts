import { Simplify } from '@ptsq/server';

export type RequestInput<TArgs, TOutput> = Simplify<
  {
    __args: TArgs;
  } & (TOutput extends Record<string, unknown> ? DeepBoolean<TOutput> : {})
>;

export type AnyRequestInput = RequestInput<any, any>;

export type Output<TOutput, TRequestInput extends AnyRequestInput> =
  TOutput extends Record<string, unknown>
    ? DeepPick<TOutput, TRequestInput>
    : TOutput;

export type DeepBoolean<T> = Simplify<{
  [K in keyof T]?: T[K] extends object ? Simplify<DeepBoolean<T[K]>> : boolean;
}>;

export type DeepPick<TData, TShape> = Simplify<
  OmitNever<{
    [K in keyof TShape]: K extends keyof TData
      ? TShape[K] extends object
        ? Simplify<OmitNever<DeepPick<TData[K], TShape[K]>>>
        : TShape[K] extends true
          ? TData[K]
          : never
      : never;
  }>
>;

export type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};
