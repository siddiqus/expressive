import { expressValidator } from "../../../../src"
import { IExpressiveRouter, Route } from "../../../../src"
import { GetHello } from "./getHello"
import { PostHello } from "./postHello"

const getHello = Route.get("/hello", GetHello)

const getHey = Route.get("/hey", "/hello")

const postHello = Route.post("/hello", {
    controller: PostHello
})

export const helloRouter: IExpressiveRouter = {
    routes: [
        getHello,
        getHey,
        postHello
    ]
}