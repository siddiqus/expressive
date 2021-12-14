import Joi from "@hapi/joi";
import { BaseController, ValidationSchema } from "../../../src";

export class PostUserController extends BaseController {
  validationSchema?: ValidationSchema = {
    body: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required()
    }
  }

  async handleRequest() {
    const { firstName, lastName } = this.getData().body!;

    this.ok({
      hello: `Hello ${firstName} ${lastName}!`
    });
  }
}