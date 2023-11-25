/**
 * @internal
 */
export type CORSOptions = {
  origin?: string[] | string;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  introspection?: string[] | string;
};
