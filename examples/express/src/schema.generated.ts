export type BaseRouter = {
  nodeType: BaseRouterNodeType;
  routes: Routes;
};

export type BaseRouterNodeType = 'router';

export type Routes = {
  greetings: BaseGreetingsRoute;
};

export type BaseGreetingsRoute = {
  nodeType: GreetingsNodeType;
  schemaArgs: SchemaArgs;
  schemaOutput: string;
  type: Type;
};

export type GreetingsNodeType = 'route';

export type SchemaArgs = {
  a: number;
  b?: B;
  [property: string]: any;
};

export type B = {
  a: number;
  b?: B;
  [property: string]: any;
};

export type Type = 'query';
