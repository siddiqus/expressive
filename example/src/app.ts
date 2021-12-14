import Joi from "@hapi/joi";
import { BaseController, ExpressApp, ValidationSchema } from "../../src";
import { errorHandler } from "./middlewares/error";
import { router } from "./router";

const swaggerInfo = {
  version: '2.0.0',
  title: 'Example Expressive App',
  contact: {
    name: 'Sabbir Siddiqui',
    email: 'sabbir.m.siddiqui@gmail.com'
  }
};

// todo -> add validation schema cascade
// const rootValidationSchema: ValidationSchema = {
//   query: {
//     q: Joi.string().required().valid('emnei')
//   }
// }

export default new ExpressApp(router, {
  basePath: '/',
  allowCors: true,
  swaggerInfo,
  errorHandler,
  authorizer: (req, res) => {
    console.log(`${req.url}: auth from top`);
    res.setHeader('testingAuth', 1234);
  }
}).express;