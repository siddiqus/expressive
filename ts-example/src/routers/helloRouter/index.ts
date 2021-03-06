import { Joi, Route } from '../../../../src';
import type { ExpressiveRouter } from '../../../../src';
import { GetHello } from './getHello';
import { PostHello } from './postHello';

const getHello = Route.get('/hello', GetHello);

const getHey = Route.get('/hey', '/hello');

const postHello = Route.post('/hello', {
  controller: PostHello,
  validationSchema: {
    body: {
      name: Joi.string().empty().required()
    },
    headers: Joi.object({
      Authorization: Joi.string().required(),
      'X-Some-Header': Joi.string().valid('abc')
    }).unknown(true)
  },
  authorizer: (req, res, next) => {
    if (req.headers.authorization !== '1234') {
      res.status(401).json({
        message: 'unauthorized'
      });
    } else {
      next();
    }
  },
  pre: [(req, res) => {
    console.log('pre', req.url); // do work here before any middleware or routes are registered
  }]
});

export const helloRouter: ExpressiveRouter = {
  routes: [getHello, getHey, postHello]
};
