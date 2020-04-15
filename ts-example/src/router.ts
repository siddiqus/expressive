import { Joi, Route } from '../../src';
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
      router: helloRouter,
      validationSchema: {
        headers: Joi.object({
          Authorization: Joi.string().required(),
          'X-Some-Header': Joi.string().valid('abc')
        }).unknown(true)
      }
    }
  ]
};
