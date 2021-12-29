import { ExpressiveRouter, Route } from "../../../../src";
import { CreateUserController } from "./create-user";
import { GetUserController, GetUsersController } from "./get-user";

// /users
export const userRouter: ExpressiveRouter = {
  routes: [
    Route.get('/', new GetUsersController()),
    Route.get('/:userId', new GetUserController()),
    Route.post('/', new CreateUserController())
  ]
}