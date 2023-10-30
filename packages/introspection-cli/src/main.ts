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
    describe: 'the schema url to introspectate',
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

axios
  .get(url)
  .then(async (response) => {
    let schema: string | null = null;
    let outFile: string | null = null;

    switch (lang) {
      case Languages.TS:
        schema = await compile(response.data, 'MySchema', {
          unreachableDefinitions: true,
        });

        outFile = out ?? 'schema.generated.ts';
        break;
      default:
        throw new Error('This programming language has not implement instrospection of ptsq schema');
    }

    await writeFile(outFile, schema, 'utf8');

    console.log(`Schema generated into ${resolve(outFile)}`);
  })
  .catch((error) => console.error('Error fetching schema:', error.message));
