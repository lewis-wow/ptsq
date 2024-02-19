<script lang="ts">
  import { createSvelteClient } from '../createSvelteClient';
  import { baseRouter, server } from './test1Server';

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

    result = client.test.createQuery({
      name: 'John',
    });
  });
</script>

<div data-testid="isFetching">{$result?.isFetching}</div>
<div data-testid="data">{$result?.data}</div>
