export type DataTransformer = {
  serialize: (object: unknown) => unknown;
  deserialize: <TDeserializeOutput = unknown>(object: unknown) => TDeserializeOutput;
};

export type CombinedDataTransformer = {
  input: DataTransformer;
  output: DataTransformer;
};

export type DataTransformerClient = {
  input: Pick<CombinedDataTransformer['input'], 'serialize'>;
  output: Pick<CombinedDataTransformer['output'], 'deserialize'>;
};

export type DataTransformerServer = {
  input: Pick<CombinedDataTransformer['input'], 'deserialize'>;
  output: Pick<CombinedDataTransformer['output'], 'serialize'>;
};

export const defaultDataTransformer: DataTransformer = {
  serialize: (obj) => obj,
  deserialize: <TDeserializeOutput = unknown>(obj: unknown) => obj as TDeserializeOutput,
};

export type inferDeserializeDataTransformerOutput<TDataTransformer, TData> = TDataTransformer extends {
  deserialize: (data: TData) => infer inferedResult;
}
  ? inferedResult
  : never;
