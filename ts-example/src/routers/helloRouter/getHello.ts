import { Request, Response } from "express";

export function GetHello(req: Request, res: Response) {
    res.json({
        hello: "world"
    })
}