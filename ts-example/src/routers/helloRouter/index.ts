import { expressValidator } from "../../../../src"
import { IExpressiveRouter, Route } from "../../../../src"
import { GetHello } from "./getHello"
import { PostHello } from "./postHello"

const getHello = Route.get("/hello", GetHello)

const getHey = Route.get("/hey", "/hello")

const postHello = Route.post("/hello", {
    controller: PostHello,
    validator: [
        expressValidator.body("name")
            .not().isEmpty().withMessage("Must provide 'name' parameter.")
            .not().isEmpty().withMessage("'name' parameter must not be empty")
            .isString().withMessage("'name' parameter must be a string")
    ],
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
