import { expect, test } from 'vitest';
import { createServer } from './createServer';
import { Serve } from './serve';

test('Should create serve and return The route was invalid', async () => {
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

  expect(
    await serve.call({
      body: { route: 'a.b' },
      params: {},
      router: baseRouter,
    }),
  ).toMatchInlineSnapshot(`
    {
      "ctx": {},
      "error": [_HTTPError: The route was invalid.],
      "ok": false,
    }
  `);
});
