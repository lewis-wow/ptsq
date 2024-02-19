<script lang="ts">
  import { createSvelteClient } from '../createSvelteClient';
  import { baseRouter, server } from './test4Server';

  let result:
    | ReturnType<
        ReturnType<
          typeof createSvelteClient<typeof baseRouter>
        >['test']['createInfiniteQuery']
      >
    | undefined;

  server.subscribe((payload) => {
    const client = createSvelteClient<typeof baseRouter>({
      url: payload.url,
    });

    result = client.test.createInfiniteQuery(
      {},
      {
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  });
</script>

<button data-testid="fetchNextPage" on:click={() => $result?.fetchNextPage()}>
  fetchNextPage
</button>

<div data-testid="isFetching">{$result?.isFetching}</div>
<div data-testid="data">{JSON.stringify($result?.data)}</div>
