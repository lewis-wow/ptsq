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
    },
  });
});
