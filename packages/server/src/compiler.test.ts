import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { expect, test } from 'vitest';
import { Compiler } from './compiler';

test('Should not compile the same validation schema more than 1 time with 10000 iterations', () => {
  const compiler = new Compiler();

  const schema1 = Type.Object({
    name: Type.String(),
  });

  const schema2 = Type.Object({
    name: Type.String(),
  });

  console.time('compile');
  compiler.get(schema1);
  console.timeEnd('compile');

  console.time('pick cache');
  for (let i = 0; i < 10_000; i++) {
    compiler.get(schema2); // not the same ref
  }
  console.timeEnd('pick cache');

  console.time('no pick cache');
  for (let i = 0; i < 10_000; i++) {
    TypeCompiler.Compile(schema2);
  }
  console.timeEnd('no pick cache');

  expect(compiler._def.hits).toBe(10_000);
});

test('Should not compile the same validation schema more than 1 time with 10000 iterations', () => {
  const compiler = new Compiler();

  const schema1 = Type.Intersect([
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
  ]);

  const schema2 = Type.Intersect([
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
  ]);

  console.time('compile');
  compiler.get(schema1);
  console.timeEnd('compile');

  console.time('pick cache');
  for (let i = 0; i < 10_000; i++) {
    compiler.get(schema2); // not the same ref
  }
  console.timeEnd('pick cache');

  console.time('no pick cache');
  for (let i = 0; i < 10_000; i++) {
    TypeCompiler.Compile(schema2);
  }
  console.timeEnd('no pick cache');

  expect(compiler._def.hits).toBe(10_000);
});

test('Should not compile the same validation schema more than 1 time with 10000 iterations', () => {
  const compiler = new Compiler();

  const schema1 = Type.Union([
    Type.Intersect([
      Type.Object({
        name: Type.String(),
      }),
      Type.Object({
        a: Type.Object({
          b: Type.Object({
            c: Type.Object({
              d: Type.Object({
                e: Type.Number({
                  maximum: 1,
                  minimum: -1,
                }),
              }),
            }),
          }),
        }),
      }),
      Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    ]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),

    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
  ]);

  const schema2 = Type.Union([
    Type.Intersect([
      Type.Object({
        name: Type.String(),
      }),
      Type.Object({
        a: Type.Object({
          b: Type.Object({
            c: Type.Object({
              d: Type.Object({
                e: Type.Number({
                  maximum: 1,
                  minimum: -1,
                }),
              }),
            }),
          }),
        }),
      }),
      Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    ]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),

    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
    Type.Object({
      name: Type.String(),
    }),
    Type.Object({
      a: Type.Object({
        b: Type.Object({
          c: Type.Object({
            d: Type.Object({
              e: Type.Number({
                maximum: 1,
                minimum: -1,
              }),
            }),
          }),
        }),
      }),
    }),
    Type.Union([Type.Array(Type.Array(Type.Array(Type.Boolean())))]),
  ]);

  console.time('compile');
  compiler.get(schema1);
  console.timeEnd('compile');

  console.time('pick cache');
  for (let i = 0; i < 10_000; i++) {
    compiler.get(schema2); // not the same ref
  }
  console.timeEnd('pick cache');

  console.time('no pick cache');
  for (let i = 0; i < 10_000; i++) {
    TypeCompiler.Compile(schema2);
  }
  console.timeEnd('no pick cache');

  expect(compiler._def.hits).toBe(10_000);
});
