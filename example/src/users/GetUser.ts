import Joi from "@hapi/joi";
import { AuthorizerType, BaseController, Handler, ValidationSchema } from "../../../src";

export class GetUserController extends BaseController {
  middleware?: Handler[] = [
    async (req, res) => console.log(`${req.url}: from mid 1`),
    (req, res, next) => {
      console.log(`${req.url}: from mid 2`);
      next();
    }
  ];

  authorizer: AuthorizerType = (req, res) => {
    console.log(`auth from route: ${req.url}`);
  }

  validationSchema: ValidationSchema = {
    query: {
      something: Joi.string().optional()
    }
  }

  async handleRequest() {
    this.ok({
      user: {
        id: 1,
        name: 'Sabbir'
      }
    })
  }
}