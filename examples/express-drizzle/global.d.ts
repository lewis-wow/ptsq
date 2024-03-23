/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly DATABASE_URL: string;
  }
}
