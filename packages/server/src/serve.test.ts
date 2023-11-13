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

  await expect(async () => await serve.call({ body: { route: 'a.b' }, params: {} })).rejects.toThrowError(
    new Error('Router must be set by Serve.adapt before server call.')
  );

  const { router } = createServer({
    ctx: contextBuilder,
  });

  const baseRouter = router({});

  serve.adapt({ router: baseRouter });

  /**
   * should pass even with bad params type
   */
  expect(await serve.call({ body: { route: 'a.b' }, params: {} })).toMatchInlineSnapshot(`
    {
      "ctx": {
        "test1": undefined,
        "test2": "Hello",
      },
      "error": [_HTTPError: The route was invalid.],
      "ok": false,
    }
  `);

  expect(await serve.call({ body: { route: 'a.b' }, params: { test1: 1 } })).toMatchInlineSnapshot(`
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
  expect(await serve.call({ body: { route: 'a.b' }, params: { test1: 'not a number' } })).toMatchInlineSnapshot(`
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
