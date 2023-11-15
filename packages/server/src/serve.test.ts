import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { Serve } from './serve';

test('Should create serve', async () => {
  const contextBuilder = ({ test1 }: { test1: number }) => ({
    test1,
    test2: 'Hello',
  });

  const serve = new Serve({
    contextBuilder,
  });

  const { router } = createServer({
    ctx: contextBuilder,
  });

  const baseRouter = router({});

  /**
   * should pass even with bad params type
   */
  expect(
    await serve.call({
      body: { route: 'a.b' },
      params: {},
      router: baseRouter,
    }),
  ).toMatchInlineSnapshot(`
    {
      "ctx": {
        "test1": undefined,
        "test2": "Hello",
      },
      "error": [_HTTPError: The route was invalid.],
      "ok": false,
    }
  `);

  expect(
    await serve.call({
      body: { route: 'a.b' },
      params: { test1: 1 },
      router: baseRouter,
    }),
  ).toMatchInlineSnapshot(`
    {
      "ctx": {
        "test1": 1,
        "test2": "Hello",
      },
      "error": [_HTTPError: The route was invalid.],
      "ok": false,
    }
  `);

  /**
   * should pass even with bad params type
   */
  expect(
    await serve.call({
      body: { route: 'a.b' },
      params: { test1: 'not a number' },
      router: baseRouter,
    }),
  ).toMatchInlineSnapshot(`
    {
      "ctx": {
        "test1": "not a number",
        "test2": "Hello",
      },
      "error": [_HTTPError: The route was invalid.],
      "ok": false,
    }
  `);
});
