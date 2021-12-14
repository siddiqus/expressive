import Joi from "@hapi/joi";
import { BaseController, ValidationSchema } from "../../../../src";

export class GetUserController extends BaseController {
  validationSchema?: ValidationSchema = {
    params: {
      userId: Joi.number().positive().required()
    }
  }
  async handleRequest() {
    const { userId } = this.getData().params;

    this.ok({
      id: userId,
      name: 'Sabbir'
    })
  }
}

export class GetUsersController extends BaseController {
  async handleRequest() {
    this.ok([
      {
        id: 1,
        name: 'Sabbir'
      },
      {
        id: 2,
        name: 'John'
      }
    ])
  }
}