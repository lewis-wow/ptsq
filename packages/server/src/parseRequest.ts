import { JsonSchemaParser } from './jsonSchemaParser';
import { PtsqError, PtsqErrorCode } from './ptsqError';
import { requestBodySchema } from './requestBodySchema';

/**
 * @internal
 */
type ParseRequestArgs = {
  request: Request;
  parser: JsonSchemaParser;
};

/**
 * @internal
 *
 * Parse the request and validate a request body structure
 */
export const parseRequest = async ({ request, parser }: ParseRequestArgs) => {
  const body = await request.json();

  const parsedRequestBody = await parser.decode({
    value: body,
    schema: requestBodySchema,
  });

  if (!parsedRequestBody.ok)
    throw new PtsqError({
      code: PtsqErrorCode.BAD_REQUEST_400,
      message: 'Parsing request body failed.',
      info: parsedRequestBody.errors,
    });

  return parsedRequestBody.data;
};
