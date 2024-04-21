import stringifyObject from 'stringify-object';

export type CreateTypescriptSchemaArgs = {
  json: object;
  schemaName?: string;
};

export const createTypescriptSchema = ({
  json,
  schemaName = 'BaseRouter',
}: CreateTypescriptSchemaArgs) => {
  return `import { IntrospectedRouter } from '@ptsq/server';

export const ${schemaName} = ${stringifyObject(json)} as const satisfies IntrospectedRouter;
  `;
};
