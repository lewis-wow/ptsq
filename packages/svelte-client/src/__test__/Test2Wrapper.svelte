<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import Test2 from './Test2.svelte';

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <Test2 />
</QueryClientProvider>
