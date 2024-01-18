import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';
import { Compiler } from './compiler';
import { PtsqError } from './ptsqError';
import { PtsqServer } from './ptsqServer';
import { Resolver } from './resolver';
import { Router } from './router';

test('Should create ptsqServer and serve with bad body format', async () => {
  const server = new PtsqServer({
    router: new Router({
      routes: {
        a: Resolver.createRoot()
          .output(Type.Null())
          .query(() => null),
      },
    }),
    compiler: new Compiler(),
    contextBuilder: () => ({}),
  });

  expect(
    await server.serve(
      new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
      {},
    ),
  ).toMatchObject({
    _def: {
      ok: false,
      ctx: {},
      error: new PtsqError({
        code: 'BAD_REQUEST',
        message: 'Parsing request body failed.',
      }),
    },
  });

  expect(
    await server.serve(
      new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({
          type: 'query',
        }),
      }),
      {},
    ),
  ).toMatchObject({
    _def: {
      ok: false,
      ctx: {},
      error: new PtsqError({
        code: 'BAD_REQUEST',
        message: 'Parsing request body failed.',
      }),
    },
  });

  expect(
    await server.serve(
      new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({
          route: 'a',
        }),
      }),
      {},
    ),
  ).toMatchObject({
    _def: {
      ok: false,
      ctx: {},
      error: new PtsqError({
        code: 'BAD_REQUEST',
        message: 'Parsing request body failed.',
      }),
    },
  });

  expect(
    await server.serve(
      new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({
          route: 'a',
          input: {},
        }),
      }),
      {},
    ),
  ).toMatchObject({
    _def: {
      ok: false,
      ctx: {},
      error: new PtsqError({
        code: 'BAD_REQUEST',
        message: 'Parsing request body failed.',
      }),
    },
  });
});

test('Should create ptsqServer and introspectate', () => {
  const server = new PtsqServer({
    router: new Router({
      routes: {
        a: Resolver.createRoot()
          .output(Type.Null())
          .query(() => null),
      },
    }),
    compiler: new Compiler(),
    contextBuilder: () => ({}),
  });

  expect(server.introspection()).toMatchInlineSnapshot(`
    MiddlewareResponse {
      "_def": {
        "ctx": {},
        "data": {
          "$schema": "https://json-schema.org/draft/2019-09/schema#",
          "additionalProperties": false,
          "properties": {
            "_def": {
              "additionalProperties": false,
              "properties": {
                "nodeType": {
                  "enum": [
                    "router",
                  ],
                  "type": "string",
                },
                "routes": {
                  "additionalProperties": false,
                  "properties": {
                    "a": {
                      "additionalProperties": false,
                      "properties": {
                        "_def": {
                          "additionalProperties": false,
                          "properties": {
                            "argsSchema": undefined,
                            "description": undefined,
                            "nodeType": {
                              "enum": [
                                "route",
                              ],
                              "type": "string",
                            },
                            "outputSchema": {
                              "type": "null",
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
                            "argsSchema",
                            "outputSchema",
                            "description",
                          ],
                          "type": "object",
                        },
                      },
                      "required": [
                        "_def",
                      ],
                      "type": "object",
                    },
                  },
                  "required": [
                    "a",
                  ],
                  "type": "object",
                },
              },
              "required": [
                "nodeType",
                "routes",
              ],
              "type": "object",
            },
          },
          "required": [
            "_def",
          ],
          "title": "BaseRouter",
          "type": "object",
        },
        "ok": true,
      },
    }
  `);
});
