import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/server',
  'packages/client',
  'packages/react-client',
  'packages/svelte-client',
  'packages/introspection-cli',
]);
