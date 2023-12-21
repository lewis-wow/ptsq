import { DocsThemeConfig } from 'nextra-theme-docs';
import React from 'react';

const config: DocsThemeConfig = {
  logo: <span>ptsq</span>,
  head: (
    <>
      <meta property="og:title" content="Ptsq" />
      <meta property="og:description" content="Public type-safe query" />
    </>
  ),
  project: {
    link: 'https://github.com/lewis-wow/ptsq',
  },
  docsRepositoryBase:
    'https://github.com/lewis-wow/ptsq/tree/master/apps/nextra',
  footer: {
    text: 'ptsq MIT',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – ptsq',
    };
  },
};

export default config;
