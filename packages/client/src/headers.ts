type CommonRequestHeadersList = 'Accept' | 'Content-Length' | 'User-Agent' | 'Content-Encoding' | 'Authorization';

type RawHeaderValue = string | string[] | number | boolean | null;

type ContentType =
  // eslint-disable-next-line @typescript-eslint/ban-types
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
