import { IExpressiveRouter, Route, BaseController } from "../../src";
import { helloRouter } from "./routers/helloRouter";

export const router: IExpressiveRouter = {
    routes: [
        Route.get("/health", {
            controller: (req, res) => res.json({ hello: "world" })
        })
    ],
    subroutes: [
        {
            path: "/v1",
            router: helloRouter
        }
    ]
}