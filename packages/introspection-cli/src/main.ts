import axios from 'axios';
import yargs from 'yargs';
import { compile } from 'json-schema-to-typescript';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

yargs.scriptName('introspection-cli');

yargs.usage('\nUsage: $0 [cmd] <args>').alias('h', 'help');

yargs.command(
  'url <url>',
  'Add schema url',
  (yargs) =>
    yargs.positional('url', {
      type: 'string',
      describe: 'the schema url to introspectate',
      demandOption: true,
    }),
  async (argv) => {
    const jsonSchema = await axios.get(argv.url);

    const tsSchema = await compile(jsonSchema.data, 'MySchema', {
      unreachableDefinitions: true,
    });
    await writeFile('schema.ts', tsSchema, 'utf8');

    console.log(`Schema generated into ${resolve('./schema.ts')}`);
  }
);

yargs.parse();
