/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface BaseRouter {
  nodeType: "router";
  routes: {
    greetings: BaseGreetingsRoute;
  };
}
export interface BaseGreetingsRoute {
  type: "query";
  nodeType: "route";
  schemaArgs: {
    firstName: string;
    [k: string]: unknown;
  } & {
    lastName: string;
    [k: string]: unknown;
  };
  schemaOutput: {
    [k: string]: unknown;
  };
}