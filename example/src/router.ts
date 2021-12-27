import { ExpressiveRouter, Route, subroute } from "../../src";
import { HealthController } from "./controllers/health";
import { userRouter } from "./controllers/users";

export const router: ExpressiveRouter = {
  routes: [
    Route.get('/v0/health', new HealthController()),
  ],
  subroutes: [
    subroute('/v1/users', userRouter)
  ]
}