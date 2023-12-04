import express from 'express';
import { createHTTPNodeHandler } from './ptsq';
import { baseRouter } from './routes/root';

const app = express();

app.use((req, res) =>
  createHTTPNodeHandler({
    router: baseRouter,
    ctx: {
      req,
      res,
    },
  })(req, res),
);

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});
