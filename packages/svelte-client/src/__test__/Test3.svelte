<script lang="ts">
  import { createSvelteClient } from '../createSvelteClient';
  import { baseRouter, server } from './test3Server';

  let result:
    | ReturnType<
        ReturnType<
          typeof createSvelteClient<typeof baseRouter>
        >['test']['createQuery']
      >
    | undefined;

  server.subscribe((payload) => {
    const client = createSvelteClient<typeof baseRouter>({
      url: payload.url,
    });

    // @ts-expect-error - test purposes
    result = client.test.createUndefinedMethod({
      name: 'John',
    });
  });
</script>

<div data-testid="isFetching">{$result?.isFetching}</div>
<div data-testid="data">{$result?.data}</div>
<div data-testid="error">{$result?.error?.message}</div>
