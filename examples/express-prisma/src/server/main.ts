import express from 'express';
import { createHTTPNodeHandler } from './ptsq';
import { baseRouter } from './routes/root';

const app = express();

app.use((req, res) =>
  createHTTPNodeHandler(req, res, {
    router: baseRouter,
    ctx: {
      req,
      res,
    },
  }),
);

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});
