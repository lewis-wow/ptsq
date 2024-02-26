import { PtsqUseInfiniteQuery } from './ptsqUseInifniteQuery';
import { PtsqUseQuery } from './ptsqUseQuery';
import { PtsqUseSuspenseQuery } from './ptsqUseSuspenseQuery';

export type ReactQuery<
  _TDescription extends string | undefined,
  TDefinition extends {
    args?: any;
    output: any;
  },
> = {
  useQuery: PtsqUseQuery<TDefinition>;
  useSuspenseQuery: PtsqUseSuspenseQuery<TDefinition>;
} & (TDefinition['args'] extends { pageParam: any }
  ? {
      useInfiniteQuery: PtsqUseInfiniteQuery<TDefinition>;
    }
  : {});
