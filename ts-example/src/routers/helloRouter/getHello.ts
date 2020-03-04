import { Request, Response } from "../../../../src";

export function GetHello(req: Request, res: Response) {
    res.json({
        hello: "world"
    })
}