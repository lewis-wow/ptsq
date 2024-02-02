<script lang="ts">
  import { createSvelteClient } from '../createSvelteClient';
  import { baseRouter, server } from './test2Server';

  let result: ReturnType<
    ReturnType<
      typeof createSvelteClient<typeof baseRouter>
    >['test']['createMutation']
  >;

  server.subscribe((payload) => {
    const client = createSvelteClient<typeof baseRouter>({
      url: payload.url,
    });

    result = client.test.createMutation();
  });
</script>

<button
  data-testid="mutate"
  on:click={() => {
    $result.mutate({
      name: 'John',
    });

    console.log('click');
  }}
>
  Mutate
</button>

<div data-testid="isPending">{$result.isPending}</div>
<div data-testid="data">{$result.data}</div>
