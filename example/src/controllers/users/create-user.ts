// import Joi from "@hapi/joi";
import { BaseController, Handler, Joi, ValidationSchema } from "../../../../src";
import { someMiddleware } from "../../middlewares/user-middleware";

export class CreateUserController extends BaseController {
  middleware?: Handler[] | undefined = [someMiddleware]

  validationSchema?: ValidationSchema = {
    body: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required()
    }
  }

  async handleRequest() {
    const { firstName, lastName } = this.getData().body;

    this.ok({
      hello: `Hello ${firstName} ${lastName}!`
    });
  }
}