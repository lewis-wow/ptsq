import { StringOptions, TString, Type } from '@sinclair/typebox';

export type StringArg = TString;

export const stringArg = (options?: StringOptions) => Type.String(options);
