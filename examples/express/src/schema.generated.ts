/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface RootRouter {
  nodeType: 'router';
  routes: {
    test: RootTestRoute;
  };
}
export interface RootTestRoute {
  type: 'query';
  nodeType: 'route';
  inputValidationSchema: {
    /**
     * URL string
     */
    url: string;
  };
  /**
   * URL string
   */
  outputValidationSchema: string;
}
