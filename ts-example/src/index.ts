import { BaseController, ExpressApp, IExpressiveRouter, Route, subroute } from "../../src";

class HelloController extends BaseController {
    async handleRequest() {
        const name = this.req.body.name;
        return this.ok({
            message: `hello, ${name}`
        })
    }
}

const helloRouter: IExpressiveRouter = {
    routes: [
        Route.get("/hello", (req, res) => {
            res.json({
                hello: "ts world"
            })
        }),
        Route.get("/hey", "/hello"),
        Route.post("/hello", HelloController)
    ]
}

const router: IExpressiveRouter = {
    subroutes: [
        subroute("/v1", helloRouter)
    ]
}

const app = new ExpressApp(router, {
    errorHandler(err, req, res, next) {
        console.log(err);
        res.status(500)
        res.json({
            message: err.message
        })
    }
});

app.listen(3001, () => console.log("Running on port 3001"))