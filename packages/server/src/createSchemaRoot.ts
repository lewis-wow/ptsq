/**
 * @internal
 */
type CreateSchemaRootArgs = {
  title?: string;
  properties: object;
};

/**
 * @internal
 *
 * Creates schema root for json-schema introspection
 */
export const createSchemaRoot = ({
  properties,
}: CreateSchemaRootArgs): SchemaRoot => {
  const schemaRoot: SchemaRoot = {
    type: 'object',
    additionalProperties: false,
    properties,
    required: Object.getOwnPropertyNames(properties),
  };

  return schemaRoot;
};

/**
 * @internal
 */
export type SchemaRoot = {
  type: 'object';
  additionalProperties: false;
  properties: object;
  required: string[];
};
