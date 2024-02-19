<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import Test3 from './Test3.svelte';

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <Test3 />
</QueryClientProvider>
