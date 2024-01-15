import { createServer } from '@ptsq/server';
import { createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';
import { expect, test } from 'vitest';

test('Should instropectate simple http server', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  });

  const baseRouter = router({
    test: resolver
      .args(
        Type.Object({
          name: Type.String(),
        }),
      )
      .output(Type.String())
      .query(({ input }) => input.name),
  });

  const { introspectate, $disconnect } = await createHttpTestServer(
    serve(baseRouter),
  );

  const response = await introspectate();

  expect(response.data).toMatchInlineSnapshot(`
    {
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
                "test": {
                  "additionalProperties": false,
                  "properties": {
                    "_def": {
                      "additionalProperties": false,
                      "properties": {
                        "argsSchema": {
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
                        "outputSchema": {
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
                "test",
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
    }
  `);

  await $disconnect();
});

test('Should instropectate simple http server with empty query', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  });

  const baseRouter = router({
    test: resolver.output(Type.Null()).query(() => null),
  });

  const { introspectate, $disconnect } = await createHttpTestServer(
    serve(baseRouter),
  );

  const response = await introspectate();

  expect(response.data).toMatchInlineSnapshot(`
    {
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
                "test": {
                  "additionalProperties": false,
                  "properties": {
                    "_def": {
                      "additionalProperties": false,
                      "properties": {
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
                "test",
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
    }
  `);

  await $disconnect();
});

test('Should instropectate simple http server with nested routers', async () => {
  const { resolver, router, serve } = createServer({
    ctx: () => ({}),
  });

  const baseRouter = router({
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

  const { introspectate, $disconnect } = await createHttpTestServer(
    serve(baseRouter),
  );

  const response = await introspectate();

  expect(response.data).toMatchInlineSnapshot(`
    {
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
                "test": {
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
                            "test": {
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
                                        "test": {
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
                                                    "test": {
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
                                                                "test": {
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
                                                                            "test": {
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
                                                                                        "test": {
                                                                                          "additionalProperties": false,
                                                                                          "properties": {
                                                                                            "_def": {
                                                                                              "additionalProperties": false,
                                                                                              "properties": {
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
                                                                                        "test",
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
                                                                "test",
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
                                        "test",
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
                "test",
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
    }
  `);

  await $disconnect();
});
