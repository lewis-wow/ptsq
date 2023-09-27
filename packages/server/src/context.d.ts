export type Context = object;

export type ContextBuilder<TContext extends Context> = () => Promise<TContext> | TContext;
