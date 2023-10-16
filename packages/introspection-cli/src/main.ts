import axios from 'axios';
import yargs from 'yargs';
import { compile } from 'json-schema-to-typescript';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

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
  });

const { url, out } = argv.parseSync();

axios
  .get(url)
  .then(async (response) => {
    const tsSchema = await compile(response.data, 'MySchema', {
      unreachableDefinitions: true,
    });

    const outFile = out ?? 'schema.generated.ts';

    await writeFile(outFile, tsSchema, 'utf8');

    console.log(`Schema generated into ${resolve(outFile)}`);
  })
  .catch((error) => {
    console.error('Error fetching schema:', error.message);
  });
