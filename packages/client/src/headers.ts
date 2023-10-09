import { MaybePromise } from '@schema-rpc/server';

type CommonRequestHeadersList = 'Accept' | 'Content-Length' | 'User-Agent' | 'Content-Encoding' | 'Authorization';

type RawHeaderValue = string | string[] | number | boolean | null;

type ContentType =
  | (string & {})
  | string[]
  | number
  | boolean
  | null
  | 'text/html'
  | 'text/plain'
  | 'multipart/form-data'
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'application/octet-stream';

type RawHeaders = {
  [key: string]: RawHeaderValue;
};

export type RequestHeaders = Partial<
  RawHeaders & {
    [Key in CommonRequestHeadersList]: RawHeaderValue;
  } & {
    'Content-Type': ContentType;
  }
>;

export const getHeaders = async (headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>)) => {
  if (typeof headers !== 'function') return headers;

  return await headers();
};
