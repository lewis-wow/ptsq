type ServeArgs<TParams extends any[]> = {
  route: string[];
  params: TParams;
};

export type Serve<TParams extends any[]> = ({ route, params }: ServeArgs<TParams>) => Promise<void>;
