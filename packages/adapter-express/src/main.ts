import { Request, Response } from 'express';

export type Adapter = {
  req: Request;
  res: Response;
};

export type ExpressAdapterHandlerArgs<TContext extends object> = {
  context: TContext;
};
/*
export const expressAdapterHandler = <TContext extends object>({ context }: ExpressAdapterHandlerArgs<TContext>) => {
  const app = express();
};
*/
