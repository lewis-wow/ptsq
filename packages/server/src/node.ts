import { Context } from './context';
import { AnyMiddlewareResponse, MiddlewareMeta } from './middleware';

export abstract class Node {
  constructor() {}

  abstract getSchema(): object;

  abstract call(callArgs: {
    ctx: Context;
    meta: MiddlewareMeta;
  }): Promise<AnyMiddlewareResponse>;
}
