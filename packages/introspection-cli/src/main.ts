#!/usr/bin/env node
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import axios from 'axios';
import yargs from 'yargs';
import { createTypescriptSchema } from './createTypescriptSchema';
import { Languages } from './languages';

const argv = yargs
  .scriptName('introspection-cli')
  .usage('\nUsage: $0 --url=<url> --out=<outputPath>')
  .alias('h', 'help')
  .option('url', {
    alias: 'u',
    describe: 'the ptsq url to introspectate',
    type: 'string',
    demandOption: true,
  })
  .option('name', {
    alias: 'n',
    describe: 'The name of schema, default is "BaseRouter"',
    type: 'string',
    demandOption: false,
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

const { url, out, lang, name } = argv.parseSync();

const parsedUrl = new URL(url);

axios
  .get(parsedUrl.href, {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
  .then(async (response) => {
    let schema: string | null = null;
    let outFile: string | null = null;

    switch (lang.toUpperCase()) {
      case Languages.TS:
        schema = createTypescriptSchema({
          json: response.data,
          schemaName: name,
        });

        outFile = out ?? 'schema.generated.ts';
        break;
      case Languages.RAW:
        schema = JSON.stringify(response.data);

        outFile = out ?? 'schema.generated.json';
        break;
      default:
        throw new Error(
          `This programming language (${lang}) has not implement instrospection of ptsq schema`,
        );
    }

    if (!outFile) throw new Error('Out file is not defined.');

    await writeFile(outFile, schema!, 'utf8');

    console.log(`Schema generated into ${resolve(outFile)}`);
  })
  .catch((error) => console.error('Error fetching schema:', error));
