import type { AnyRouter } from './router';

export class Introspecion {
  _def: {
    router: AnyRouter;
    title: 'BaseRouter';
    $schema: 'https://json-schema.org/draft/2019-09/schema#';
  };

  constructor(router: AnyRouter) {
    this._def = {
      router,
      title: 'BaseRouter',
      $schema: 'https://json-schema.org/draft/2019-09/schema#',
    };
  }

  toJson() {
    return {
      title: this._def.title,
      $schema: this._def.$schema,
      ...this._def.router.getJsonSchema(),
    };
  }

  toString() {
    return JSON.stringify(this.toJson());
  }

  toResponse() {
    return new Response(this.toString());
  }
}
