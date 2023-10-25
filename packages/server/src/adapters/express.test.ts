import { expect, test } from 'vitest';
import { createServer } from '../createServer';
import express from 'express';
import { expressAdapter, type ExpressAdapterContext } from './express';
import axios from 'axios';
import { z } from 'zod';

test('Should create empty server with express adapter', async () => {
  const app = express();

  const { router, serve } = createServer({
    ctx: ({ req, res }: ExpressAdapterContext) => ({
      req,
      res,
    }),
  });

  const baseRouter = router({});

  app.use('/ptsq', expressAdapter(serve({ router: baseRouter })));

  const testServer = app.listen(4445);

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
  const app = express();

  const { router, serve, resolver } = createServer({
    ctx: ({ req, res }: ExpressAdapterContext) => ({
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

  app.use('/ptsq', expressAdapter(serve({ router: baseRouter })));

  const testServer = app.listen(4445);

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
  const app = express();

  const { router, serve, resolver } = createServer({
    ctx: ({ req, res }: ExpressAdapterContext) => ({
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

  app.use('/ptsq', expressAdapter(serve({ router: baseRouter })));

  const testServer = app.listen(4445);

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
