import { SchemaOptions, TTemplateLiteral, Type } from '@sinclair/typebox';

export type TemplateLiteralArg = TTemplateLiteral;

export const templateLiteralArg = <T extends string>(
  templateDsl: T,
  options?: SchemaOptions,
) => Type.TemplateLiteral<T>(templateDsl, options);
