import { CorsOptions } from "cors";
import { ErrorRequestHandler, Express, Handler, NextFunction, Request, Response } from "express";
import { ValidationChain } from "express-validator";
import { IHelmetConfiguration } from "helmet";


export declare interface ISwaggerInfoContact {
    name?: string
    email?: string
}

export declare interface ISwaggerInfo {
    version?: string
    title?: string
    contact?: ISwaggerInfoContact
}

export declare class BaseController {
    handleRequest(): Promise<void> | void

    req: Request
    res: Response
    next: NextFunction

    ok(data?: any): void

    created(data?: any): void

    accepted(data?: any): void

    noContent(): void

    badRequest(message?: string): void

    unauthorized(message?: string): void

    forbidden(message?: string): void

    notFound(message?: string): void

    tooMany(message?: string): void

    internalServerError(message?: string, body?: any): void
}

export declare interface IRouteParams {
    validator?: ValidationChain[]
    authorizer?: Handler
    doc?: any
    middleware?: Handler[]
}

export declare type RouteMethod = "get" | "post" | "put" | "delete" | "head" | "patch" | "options"

export declare interface IEndpoint {
    method: RouteMethod
    path: string
    controller: string | Handler | typeof BaseController
    validator?: ValidationChain[]
    doc?: any
    authorizer?: Handler
    middleware?: Handler[]
}

export declare class Route {
    constructor(
        method: RouteMethod,
        path: string,
        controller: Handler | typeof BaseController,
        routeParams?: IRouteParams
    )

    static get(
        path: string,
        controller: Handler | string | typeof BaseController,
        options?: IRouteParams
    ): Route

    static post(
        path: string,
        controller: Handler | string | typeof BaseController,
        options?: IRouteParams
    ): Route

    static put(
        path: string,
        controller: Handler | string | typeof BaseController,
        options?: IRouteParams
    ): Route

    static delete(
        path: string,
        controller: Handler | string | typeof BaseController,
        options?: IRouteParams
    ): Route

    static head(
        path: string,
        controller: Handler | string | typeof BaseController,
        options?: IRouteParams
    ): Route

    static patch(
        path: string,
        controller: Handler | string | typeof BaseController,
        options?: IRouteParams
    ): Route

    static options(
        path: string,
        controller: Handler | string | typeof BaseController,
        options?: IRouteParams
    ): Route
}

export declare interface ISubroute {
    path: String
    router: IExpressiveRouter
    authorizer?: Handler
    middleware?: Handler[]
}

export declare interface ISubrouteOptions {
    authorizer?: Handler
    middleware?: Handler[]
}

export declare interface IExpressiveRouter {
    routes?: Route[] | IEndpoint[]
    subroutes?: ISubroute[]
}

export interface IExpressiveOptions {
    basePath?: string;
    showSwaggerOnlyInDev?: boolean;
    swaggerInfo?: ISwaggerInfo;
    swaggerDefinitions?: any;
    allowCors?: boolean
    corsConfig?: CorsOptions
    middleware?: Handler[]
    authorizer?: Handler
    errorHandler?: ErrorRequestHandler
    bodyLimit?: string
    helmetOptions?: IHelmetConfiguration
}

export declare class ExpressApp {
    constructor(router: IExpressiveRouter, options?: IExpressiveOptions)
    express: Express
    listen(port: number, cb: Function): void
}

export declare interface Expressive {
    ExpressApp: ExpressApp
    Route: Route,
    BaseController: BaseController
    // RouteUtil:
    // SwaggerUtils,
    // serverless,
    // expressValidator,
    // SwaggerBuilder
}
