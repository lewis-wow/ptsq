<script lang="ts">
  import { client } from '$lib/ptsq';

  const greetingsQuery = client.greetings.getGreetings.createQuery();
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<div>{$greetingsQuery.data}</div>
