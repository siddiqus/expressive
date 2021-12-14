import { ExpressiveRouter, Route, subroute } from "../../src";
import { HealthController } from "./controllers/health";
import { CreateUserController } from "./controllers/users/createUser";
import { GetUserController, GetUsersController } from "./controllers/users/getUser";

export const router: ExpressiveRouter = {
  routes: [
    Route.get('/v0/health', new HealthController()),
  ],
  subroutes: [
    subroute('/users', {
      routes: [
        Route.get('/', new GetUsersController()),
        Route.get('/:userId', new GetUserController()),
        Route.post('/', new CreateUserController())
      ]
    })
  ]
}