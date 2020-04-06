import { Joi } from "../../../../src"
import { IExpressiveRouter, Route } from "../../../../src"
import { GetHello } from "./getHello"
import { PostHello } from "./postHello"

const getHello = Route.get("/hello", GetHello)

const getHey = Route.get("/hey", "/hello")

const postHello = Route.post("/hello", {
    controller: PostHello,
    validationSchema: {
        body: {
            name: Joi.string()
                .empty()
                .required()
        }
    },
    authorizer: (req, res, next) => {
        if (req.headers.authorization !== '1234') {
            res.status(401).json({
                message: "unauthorized"
            })
        } else {
            next()
        }
    }
})

export const helloRouter: IExpressiveRouter = {
    routes: [
        getHello,
        getHey,
        postHello
    ]
}
