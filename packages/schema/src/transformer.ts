export type DataTransformer = {
  serialize(object: any): any;
  deserialize<TDeserializeOutput = any>(object: any): TDeserializeOutput;
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
  deserialize: (obj) => obj,
};

export type inferDeserializeDataTransformerOutput<TDataTransformer, T> = TDataTransformer extends {
  deserialize: (data: T) => infer R;
}
  ? R
  : never;
