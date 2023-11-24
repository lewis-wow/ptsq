import { parsePhoneNumber } from 'awesome-phonenumber';

/**
 * Transform E.164 phone number string into phone number details object
 *
 * @see https://en.wikipedia.org/wiki/E.164
 * @see https://www.npmjs.com/package/awesome-phonenumber
 */
export const phoneNumberTransformer = (value: string) =>
  parsePhoneNumber(value);
