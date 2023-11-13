#!/usr/bin/env node

import axios from 'axios';
import yargs from 'yargs';
import { compile } from 'json-schema-to-typescript';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { Languages } from './languages';

const argv = yargs
  .scriptName('introspection-cli')
  .usage('\nUsage: $0 --url=<url> --out=<outputPath>')
  .alias('h', 'help')
  .option('url', {
    alias: 'u',
    describe: 'the ptsq url to introspectate, should be without /introspection path',
    type: 'string',
    demandOption: true,
  })
  .option('out', {
    alias: 'o',
    describe: 'the output path of the generated schema',
    type: 'string',
    demandOption: false,
  })
  .option('lang', {
    alias: 'l',
    describe: 'the programming language of the generated schema',
    type: 'string',
    demandOption: false,
    default: Languages.TS,
  });

const { url, out, lang } = argv.parseSync();

const parsedUrl = new URL(url);

axios
  .get(`${parsedUrl.href}/introspection`)
  .then(async (response) => {
    let schema: string | null = null;
    let outFile: string | null = null;

    switch (lang.toUpperCase()) {
      case Languages.TS:
        schema = await compile(response.data, 'MySchema');

        outFile = out ?? 'schema.generated.ts';
        break;
      case Languages.RAW:
        schema = JSON.stringify(response.data);

        outFile = out ?? 'schema.generated.json';
        break;
      default:
        throw new Error(`This programming language (${lang}) has not implement instrospection of ptsq schema`);
    }

    await writeFile(outFile, schema!, 'utf8');

    console.log(`Schema generated into ${resolve(outFile)}`);
  })
  .catch((error) => console.error('Error fetching schema:', error.message));
