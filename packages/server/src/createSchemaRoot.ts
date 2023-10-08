import pascalcase from 'pascalcase';

type CreateSchemaRootArgs = {
  title?: string;
  properties: object;
};

export const createSchemaRoot = ({ title, properties }: CreateSchemaRootArgs) => {
  return {
    title: title ? pascalcase(title) : undefined,
    type: 'object',
    additionalProperties: false,
    properties,
    required: Object.getOwnPropertyNames(properties),
  };
};
