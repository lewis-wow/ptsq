import { Static } from '@sinclair/typebox';
import { AnyArg } from './any';
import { AnyArrayArg } from './array';
import { AnyComposite } from './composite';
import { AnyEnumArg } from './enum';
import { IntegerArg } from './integer';
import { AnyIntersect } from './intersect';
import { NullArg } from './null';
import { NumberArg } from './number';
import { AnyObjectArg } from './object';
import { AnyRecordArg } from './record';
import { StringArg } from './string';
import { TemplateLiteralArg } from './templateLiteral';
import { AnyTupleArg } from './tuple';
import { UndefinedArg } from './undefined';
import { AnyUnionArg } from './union';
import { UnknownArg } from './unknown';

export type SchemaArg =
  | IntegerArg
  | NumberArg
  | StringArg
  | AnyObjectArg
  | AnyArrayArg
  | UndefinedArg
  | NullArg
  | AnyUnionArg
  | AnyTupleArg
  | AnyEnumArg
  | TemplateLiteralArg
  | AnyIntersect
  | AnyComposite
  | AnyRecordArg
  | UnknownArg
  | AnyArg
  | never;

export type inferSchemaArg<T extends SchemaArg> = Static<T>;
