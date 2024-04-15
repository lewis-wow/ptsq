<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@ptsq/svelte-client';

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <slot />
</QueryClientProvider>
