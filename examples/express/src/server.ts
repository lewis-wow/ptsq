import express from 'express';
import { ptsqEndpoint, serve } from './ptsq';
import { baseRouter } from './routers';

const app = express();

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log(`Listening on: http://localhost:4000/${ptsqEndpoint}`);
});

export type BaseRouter = typeof baseRouter;
