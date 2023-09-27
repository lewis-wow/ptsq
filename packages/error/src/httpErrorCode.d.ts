export type HTTPErrorCode = {
  BAD_REQUEST: 400;
  UNAUTHORIZED: 401;
  FORBIDDEN: 403;
  NOT_FOUND: 404;
  TIMEOUT: 408;
  CONFLICT: 409;
  PRECONDITION_FAILED: 412;
  PAYLOAD_TOO_LARGE: 413;
  METHOD_NOT_SUPPORTED: 405;
  UNPROCESSABLE_CONTENT: 422;
  TOO_MANY_REQUESTS: 429;
  CLIENT_CLOSED_REQUEST: 499;
  INTERNAL_SERVER_ERROR: 500;
};