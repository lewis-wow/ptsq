import type { Compiler } from './compiler';
import { PtsqError, PtsqErrorCode } from './ptsqError';
import { requestBodySchema } from './requestBodySchema';

type ParseRequestArgs = {
  request: Request;
  compiler: Compiler;
};

/**
 * @internal
 *
 * Parse the request and validate a request body structure
 */
export const parseRequest = async ({ request, compiler }: ParseRequestArgs) => {
  const body = await request.json();

  const requestBodySchemaParser = compiler.getParser(requestBodySchema);

  const parsedRequestBody = requestBodySchemaParser.parse({
    value: body,
    mode: 'decode',
  });

  if (!parsedRequestBody.ok)
    throw new PtsqError({
      code: PtsqErrorCode.BAD_REQUEST_400,
      message: 'Parsing request body failed.',
      info: parsedRequestBody.errors,
    });

  return parsedRequestBody.data;
};
