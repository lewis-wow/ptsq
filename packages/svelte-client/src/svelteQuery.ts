import { PtsqCreateInfiniteQuery } from './ptsqCreateInfiniteQuery';
import { PtsqCreateQuery } from './ptsqCreateQuery';

export type SvelteQuery<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  createQuery: PtsqCreateQuery<TDefinition>;
} & (TDefinition['args'] extends { pageParam: any }
  ? {
      createInfiniteQuery: PtsqCreateInfiniteQuery<TDefinition>;
    }
  : {});
