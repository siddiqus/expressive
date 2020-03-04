import { ExpressApp, IExpressiveRouter, Route, subroute } from "../../src"
import express from "express"

const router: IExpressiveRouter = {
    routes: [
        Route.get("/hello", (req, res) => {
            res.json({
                hello: "ts world"
            })
        }),
        Route.get("/hey", "/hello")
    ]
}

const app = new ExpressApp(router);

app.express.listen(3001, () => console.log("Running on port 3001"))