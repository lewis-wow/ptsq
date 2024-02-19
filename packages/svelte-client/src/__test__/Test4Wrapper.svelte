<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import Test4 from './Test4.svelte';

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <Test4 />
</QueryClientProvider>
