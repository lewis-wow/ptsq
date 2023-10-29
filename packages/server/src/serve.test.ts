import { expect, test } from 'vitest';
import { Serve } from './serve';
import { createServer } from './createServer';

test('Should create serve', async () => {
  const contextBuilder = ({ test1 }: { test1: number }) => ({
    test1,
    test2: 'Hello',
  });

  const serve = new Serve({
    contextBuilder,
  });

  await expect(async () => await serve.serve({ route: 'a.b', params: {} })).rejects.toThrowError(
    new Error('Router must be set by Serve.adapter before serve the server')
  );

  const { router } = createServer({
    ctx: contextBuilder,
  });

  const baseRouter = router({});

  serve.adapter({ router: baseRouter });

  /**
   * should pass even with bad params type
   */
  expect(await serve.serve({ route: 'a.b', params: {} })).toMatchInlineSnapshot(`
    {
      "ctx": {
        "test1": undefined,
        "test2": "Hello",
      },
      "route": Queue {
        "_size": 2,
        "head": QueueNode {
          "next": QueueNode {
            "next": undefined,
            "value": "b",
          },
          "value": "a",
        },
        "tail": QueueNode {
          "next": undefined,
          "value": "b",
        },
      },
    }
  `);

  expect(await serve.serve({ route: 'a.b', params: { test1: 1 } })).toMatchInlineSnapshot(`
    {
      "ctx": {
        "test1": 1,
        "test2": "Hello",
      },
      "route": Queue {
        "_size": 2,
        "head": QueueNode {
          "next": QueueNode {
            "next": undefined,
            "value": "b",
          },
          "value": "a",
        },
        "tail": QueueNode {
          "next": undefined,
          "value": "b",
        },
      },
    }
  `);

  /**
   * should pass even with bad params type
   */
  expect(await serve.serve({ route: 'a.b', params: { test1: 'not a number' } })).toMatchInlineSnapshot(`
    {
      "ctx": {
        "test1": "not a number",
        "test2": "Hello",
      },
      "route": Queue {
        "_size": 2,
        "head": QueueNode {
          "next": QueueNode {
            "next": undefined,
            "value": "b",
          },
          "value": "a",
        },
        "tail": QueueNode {
          "next": undefined,
          "value": "b",
        },
      },
    }
  `);
});
