import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span>Schema-rpc</span>,
  project: {
    link: 'https://github.com/lewis-wow/bakalarska-prace',
  },
  docsRepositoryBase: 'https://github.com/lewis-wow/bakalarska-prace',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Schema-rpc',
    };
  },
};

export default config;
