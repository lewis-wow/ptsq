import { HTTPErrorCode } from './httpErrorCode';

export type HTTPErrorOptions = {
  httpErrorCode: keyof HTTPErrorCode;
  message?: string;
};

export class HTTPError {
  public httpErrorCode: keyof HTTPErrorCode;
  public message?: string;

  constructor({ httpErrorCode, message }: HTTPErrorOptions) {
    this.httpErrorCode = httpErrorCode;
    this.message = message;
  }
}
