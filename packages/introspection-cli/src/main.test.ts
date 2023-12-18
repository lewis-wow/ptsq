import { createTestHttpServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import axios from 'axios';
import { expect, test } from 'vitest';

test('Should instropectate simple http server', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: resolver
          .args(
            Type.Object({
              name: Type.String(),
            }),
          )
          .output(Type.String())
          .query(({ input }) => input.name),
      });
    },
    client: async (serverUrl) => {
      const response = await axios.get(`${serverUrl}/introspection`);

      expect(response.data).toMatchInlineSnapshot(`
        {
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
                "test": {
                  "additionalProperties": false,
                  "properties": {
                    "nodeType": {
                      "enum": [
                        "route",
                      ],
                      "type": "string",
                    },
                    "schemaArgs": {
                      "additionalProperties": false,
                      "properties": {
                        "name": {
                          "type": "string",
                        },
                      },
                      "required": [
                        "name",
                      ],
                      "type": "object",
                    },
                    "schemaOutput": {
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
                    "schemaArgs",
                    "schemaOutput",
                  ],
                  "title": "BaseTestRoute",
                  "type": "object",
                },
              },
              "required": [
                "test",
              ],
              "type": "object",
            },
          },
          "required": [
            "nodeType",
            "routes",
          ],
          "title": "BaseRouter",
          "type": "object",
        }
      `);
    },
  });
});

test('Should instropectate simple http server with empty query', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: resolver.output(Type.Null()).query(() => null),
      });
    },
    client: async (serverUrl) => {
      const response = await axios.get(`${serverUrl}/introspection`);

      expect(response.data).toMatchInlineSnapshot(`
        {
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
                "test": {
                  "additionalProperties": false,
                  "properties": {
                    "nodeType": {
                      "enum": [
                        "route",
                      ],
                      "type": "string",
                    },
                    "schemaArgs": {
                      "not": {},
                    },
                    "schemaOutput": {
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
                    "schemaArgs",
                    "schemaOutput",
                  ],
                  "title": "BaseTestRoute",
                  "type": "object",
                },
              },
              "required": [
                "test",
              ],
              "type": "object",
            },
          },
          "required": [
            "nodeType",
            "routes",
          ],
          "title": "BaseRouter",
          "type": "object",
        }
      `);
    },
  });
});

test('Should instropectate simple http server with nested routers', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: router({
          test: router({
            test: router({
              test: router({
                test: router({
                  test: router({
                    test: resolver.output(Type.Null()).query(() => null),
                  }),
                }),
              }),
            }),
          }),
        }),
      });
    },
    client: async (serverUrl) => {
      const response = await axios.get(`${serverUrl}/introspection`);

      expect(response.data).toMatchInlineSnapshot(`
        {
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
                "test": {
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
                        "test": {
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
                                "test": {
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
                                        "test": {
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
                                                "test": {
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
                                                        "test": {
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
                                                                "test": {
                                                                  "additionalProperties": false,
                                                                  "properties": {
                                                                    "nodeType": {
                                                                      "enum": [
                                                                        "route",
                                                                      ],
                                                                      "type": "string",
                                                                    },
                                                                    "schemaArgs": {
                                                                      "not": {},
                                                                    },
                                                                    "schemaOutput": {
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
                                                                    "schemaArgs",
                                                                    "schemaOutput",
                                                                  ],
                                                                  "title": "BaseTestTestTestTestTestTestTestRoute",
                                                                  "type": "object",
                                                                },
                                                              },
                                                              "required": [
                                                                "test",
                                                              ],
                                                              "type": "object",
                                                            },
                                                          },
                                                          "required": [
                                                            "nodeType",
                                                            "routes",
                                                          ],
                                                          "title": "BaseTestTestTestTestTestTestRouter",
                                                          "type": "object",
                                                        },
                                                      },
                                                      "required": [
                                                        "test",
                                                      ],
                                                      "type": "object",
                                                    },
                                                  },
                                                  "required": [
                                                    "nodeType",
                                                    "routes",
                                                  ],
                                                  "title": "BaseTestTestTestTestTestRouter",
                                                  "type": "object",
                                                },
                                              },
                                              "required": [
                                                "test",
                                              ],
                                              "type": "object",
                                            },
                                          },
                                          "required": [
                                            "nodeType",
                                            "routes",
                                          ],
                                          "title": "BaseTestTestTestTestRouter",
                                          "type": "object",
                                        },
                                      },
                                      "required": [
                                        "test",
                                      ],
                                      "type": "object",
                                    },
                                  },
                                  "required": [
                                    "nodeType",
                                    "routes",
                                  ],
                                  "title": "BaseTestTestTestRouter",
                                  "type": "object",
                                },
                              },
                              "required": [
                                "test",
                              ],
                              "type": "object",
                            },
                          },
                          "required": [
                            "nodeType",
                            "routes",
                          ],
                          "title": "BaseTestTestRouter",
                          "type": "object",
                        },
                      },
                      "required": [
                        "test",
                      ],
                      "type": "object",
                    },
                  },
                  "required": [
                    "nodeType",
                    "routes",
                  ],
                  "title": "BaseTestRouter",
                  "type": "object",
                },
              },
              "required": [
                "test",
              ],
              "type": "object",
            },
          },
          "required": [
            "nodeType",
            "routes",
          ],
          "title": "BaseRouter",
          "type": "object",
        }
      `);
    },
  });
});
