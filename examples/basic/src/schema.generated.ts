import { IntrospectedRouter } from '@ptsq/server';

export const schema = {
  nodeType: 'router',
  routes: {
    greetings: {
      type: 'query',
      nodeType: 'route',
      outputSchema: { type: 'string', pattern: '^Hello, (.*)!$' },
    },
  },
} as const satisfies IntrospectedRouter;
