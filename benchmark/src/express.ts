import axios from 'axios';
import benny from 'benny';
import bodyParser from 'body-parser';
import express from 'express';
import { z } from 'zod';

const TEST_PORT = 4433;

const app = express();

app.use(bodyParser.json());

const schema = z.object({
  firstName: z.string().min(4),
  lastName: z.string(),
});

app.post('/user/create', (req, res) => {
  const parsed = schema.parse(req.body);

  res.json({
    name: `${parsed.firstName} ${parsed.lastName}`,
  });
});

app.listen(TEST_PORT);

export const expressBenchmarkTestCase = benny.add('Express', async () => {
  await axios.post(`http://localhost:${TEST_PORT}/user/create`, {
    firstName: 'John',
    lastName: 'Doe',
  });
});
