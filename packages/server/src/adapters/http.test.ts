import { expect, test } from 'vitest';
import { createServer } from '../createServer';
import axios from 'axios';
import { httpAdapter, type HttpAdapterContext } from './http'
import { createServer as createHttpServer } from 'http';
import { z } from 'zod'

test('Should create empty server with http adapter', async () => {
  const { router, serve } = createServer({
    ctx: ({ req, res }: HttpAdapterContext) => ({
      req,
      res,
    }),
  });

  const baseRouter = router({});

  const testServer = createHttpServer(httpAdapter(serve({ router: baseRouter })));

  testServer.listen(4445);

  const { data: ptsqJSONSchema } = await axios.get('http://localhost:4445/ptsq/introspection');

  expect(ptsqJSONSchema).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "nodeType": {
          "enum": [
            "router",
          ],
          "type": "string",
        },
        "routes": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": false,
          "properties": {},
          "required": [],
          "type": "object",
        },
      },
      "required": [
        "nodeType",
        "routes",
      ],
      "title": "RootRouter",
      "type": "object",
    }
  `);

  await new Promise((resolve) => testServer.close(resolve));
});

test('Should create server with one mutation with express adapter', async () => {
  const { router, serve, resolver } = createServer({
    ctx: ({ req, res }: HttpAdapterContext) => ({
      req,
      res,
    }),
  });

  const query = resolver.mutation({
    input: z.string(),
    output: z.string(),
    resolve: ({ input }) => input,
  });

  const baseRouter = router({
    query,
  });

  const testServer = createHttpServer(httpAdapter(serve({ router: baseRouter })));

  testServer.listen(4445);

  const { data: ptsqJSONSchema } = await axios.get('http://localhost:4445/ptsq/introspection');
  expect(ptsqJSONSchema).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "nodeType": {
          "enum": [
            "router",
          ],
          "type": "string",
        },
        "routes": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": false,
          "properties": {
            "query": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "inputValidationSchema": {
                  "$schema": "http://json-schema.org/draft-07/schema#",
                  "type": "string",
                },
                "nodeType": {
                  "enum": [
                    "route",
                  ],
                  "type": "string",
                },
                "outputValidationSchema": {
                  "$schema": "http://json-schema.org/draft-07/schema#",
                  "type": "string",
                },
                "type": {
                  "enum": [
                    "mutation",
                  ],
                  "type": "string",
                },
              },
              "required": [
                "type",
                "nodeType",
                "inputValidationSchema",
                "outputValidationSchema",
              ],
              "title": "RootQueryRoute",
              "type": "object",
            },
          },
          "required": [
            "query",
          ],
          "type": "object",
        },
      },
      "required": [
        "nodeType",
        "routes",
      ],
      "title": "RootRouter",
      "type": "object",
    }
  `);

  await new Promise((resolve) => testServer.close(resolve));
});

test('Should create server with one query with express adapter', async () => {
  const { router, serve, resolver } = createServer({
    ctx: ({ req, res }: HttpAdapterContext) => ({
      req,
      res,
    }),
  });

  const query = resolver.query({
    input: z.string(),
    output: z.string(),
    resolve: ({ input }) => input,
  });

  const baseRouter = router({
    query,
  });

  const testServer = createHttpServer(httpAdapter(serve({ router: baseRouter })));

  testServer.listen(4445);

  const { data: ptsqJSONSchema } = await axios.get('http://localhost:4445/ptsq/introspection');
  expect(ptsqJSONSchema).toMatchInlineSnapshot(`
    {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "nodeType": {
          "enum": [
            "router",
          ],
          "type": "string",
        },
        "routes": {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "additionalProperties": false,
          "properties": {
            "query": {
              "$schema": "http://json-schema.org/draft-07/schema#",
              "additionalProperties": false,
              "properties": {
                "inputValidationSchema": {
                  "$schema": "http://json-schema.org/draft-07/schema#",
                  "type": "string",
                },
                "nodeType": {
                  "enum": [
                    "route",
                  ],
                  "type": "string",
                },
                "outputValidationSchema": {
                  "$schema": "http://json-schema.org/draft-07/schema#",
                  "type": "string",
                },
                "type": {
                  "enum": [
                    "query",
                  ],
                  "type": "string",
                },
              },
              "required": [
                "type",
                "nodeType",
                "inputValidationSchema",
                "outputValidationSchema",
              ],
              "title": "RootQueryRoute",
              "type": "object",
            },
          },
          "required": [
            "query",
          ],
          "type": "object",
        },
      },
      "required": [
        "nodeType",
        "routes",
      ],
      "title": "RootRouter",
      "type": "object",
    }
  `);

  await new Promise((resolve) => testServer.close(resolve));
});
