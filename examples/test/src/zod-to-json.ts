import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as fs from 'fs';

const mySchema = z.object({
  myString: z.string().email().min(5),
  myUnion: z.union([z.number(), z.boolean()]),
  date: z.date(),
  never: z.never(),
});

const jsonSchema = zodToJsonSchema(mySchema, 'mySchema');

fs.writeFileSync('test.json', JSON.stringify(jsonSchema));
