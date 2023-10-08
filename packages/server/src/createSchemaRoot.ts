type CreateSchemaRootArgs = {
  title?: string;
  properties: object;
};

export const createSchemaRoot = ({ title, properties }: CreateSchemaRootArgs) => {
  return {
    title,
    type: 'object',
    additionalProperties: false,
    properties,
    required: Object.getOwnPropertyNames(properties),
  };
};
