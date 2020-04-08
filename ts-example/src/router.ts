import { Route } from '../../src';
import type { ExpressiveRouter } from '../../src';
import { helloRouter } from './routers/helloRouter';

export const router: ExpressiveRouter = {
  routes: [
    Route.get('/health', {
      controller: (req, res) => res.json({ hello: 'world' })
    })
  ],
  subroutes: [
    {
      path: '/v1',
      router: helloRouter
    }
  ]
};
