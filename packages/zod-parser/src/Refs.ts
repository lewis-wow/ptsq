import { ZodTypeDef } from 'zod';
import { basePath, $refStrategy, definitionPath } from './options';
import { JsonSchema7Type } from './parseDef';

export type Refs = {
  seen: Map<ZodTypeDef, Seen>;
  currentPath: string[];
  propertyPath?: string[];
  $refStrategy: typeof $refStrategy;
  definitionPath: string;
};

export type Seen = {
  def: ZodTypeDef;
  path: string[];
  jsonSchema: JsonSchema7Type | undefined;
};

export const getRefs = (): Refs => ({
  $refStrategy,
  definitionPath,
  currentPath: basePath,
  propertyPath: undefined,
  seen: new Map(),
});
