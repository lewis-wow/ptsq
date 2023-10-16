import pascalcase from 'pascalcase';

type CreateSchemaRootArgs = {
  title?: string;
  properties: object;
};

/**
 * Creates schema root for json-schema introspection
 * TODO: better pascalcase title approach!
 */
export const createSchemaRoot = ({ title, properties }: CreateSchemaRootArgs) => {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: title ? pascalcase(title) : undefined,
    type: 'object',
    additionalProperties: false,
    properties,
    required: Object.getOwnPropertyNames(properties),
  };
};
