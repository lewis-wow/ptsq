/**
 * @internal
 */
type CommonRequestHeadersList =
  | 'Accept'
  | 'Content-Length'
  | 'User-Agent'
  | 'Content-Encoding'
  | 'Authorization';

/**
 * @internal
 */
type RawHeaderValue = string | string[] | number | boolean | null;

/**
 * @internal
 * common Content types
 *
 * `(string & {})` force IDE to hint you the options
 */
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

/**
 * Request headers that can be defined in request in axios call
 */
export type RequestHeaders = Partial<
  RawHeaders & {
    [Key in CommonRequestHeadersList]: RawHeaderValue;
  } & {
    'Content-Type': ContentType;
  }
>;
