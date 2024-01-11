import type { Context } from '../context';
import type { MiddlewareResponse } from '../middleware';

export type OnExecuteDoneHook = (options: {
  response: MiddlewareResponse<Context>;
}) => void;
