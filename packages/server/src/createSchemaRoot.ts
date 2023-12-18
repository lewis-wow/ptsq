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
 * TODO: better pascalcase title approach!
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
  $schema?: 'http://json-schema.org/draft-07/schema#';
  title?: string;
  type: 'object';
  additionalProperties: false;
  properties: object;
  required: string[];
};
