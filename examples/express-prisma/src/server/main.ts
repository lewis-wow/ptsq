import express from 'express';
import { serve } from './ptsq';
import { baseRouter } from './routes/root';

const app = express();

app.use((req, res) => serve(baseRouter).handleNodeRequest(req, { req, res }));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});
