import pascalcase from 'pascalcase';

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
  title,
  properties,
}: CreateSchemaRootArgs): SchemaRoot => {
  const schemaRoot: SchemaRoot = {
    title: title ? pascalcase(title) : undefined,
    type: 'object',
    additionalProperties: false,
    properties,
    required: Object.getOwnPropertyNames(properties),
  };

  return schemaRoot;
};

export type SchemaRoot = {
  $schema?: 'http://json-schema.org/draft-07/schema#';
  title?: string;
  type: 'object';
  additionalProperties: false;
  properties: object;
  required: string[];
};
