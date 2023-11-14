import { z } from 'zod';
import { expect, test } from 'vitest';
import { createTestHttpServer } from '@ptsq/test-utils';
import axios from 'axios';

test('Should instropectate simple http server', async () => {
  await createTestHttpServer({
    ctx: () => ({}),
    server: ({ resolver, router }) => {
      return router({
        test: resolver
          .args(
            z.object({
              name: z.string(),
            })
          )
          .query({
            output: z.string(),
            resolve: ({ input }) => input.name,
          }),
      });
    },
    client: async (serverUrl) => {
      const response = await axios.get(`${serverUrl}/introspection`);

      expect(response.data).toMatchInlineSnapshot(`
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
              "additionalProperties": false,
              "properties": {
                "test": {
                  "additionalProperties": false,
                  "properties": {
                    "args": {
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
                    "nodeType": {
                      "enum": [
                        "route",
                      ],
                      "type": "string",
                    },
                    "output": {
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
                    "args",
                    "output",
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
        test: resolver.query({
          output: z.null(),
          resolve: () => null,
        }),
      });
    },
    client: async (serverUrl) => {
      const response = await axios.get(`${serverUrl}/introspection`);

      expect(response.data).toMatchInlineSnapshot(`
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
              "additionalProperties": false,
              "properties": {
                "test": {
                  "additionalProperties": false,
                  "properties": {
                    "args": {},
                    "nodeType": {
                      "enum": [
                        "route",
                      ],
                      "type": "string",
                    },
                    "output": {
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
                    "args",
                    "output",
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
                    test: resolver.query({
                      output: z.null(),
                      resolve: () => null,
                    }),
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
                                                                    "args": {},
                                                                    "nodeType": {
                                                                      "enum": [
                                                                        "route",
                                                                      ],
                                                                      "type": "string",
                                                                    },
                                                                    "output": {
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
                                                                    "args",
                                                                    "output",
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
