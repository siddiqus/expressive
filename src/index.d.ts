import { Request, Response, NextFunction, Handler, Application, Express } from "express";
import { CorsOptions } from "cors"
import { IHelmetConfiguration } from "helmet"

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
    handleRequest(req: Request, res: Response, next?: NextFunction): Promise<void>
}

export declare interface IRouteParams {
    validator?: any | any[]
    authorizer?: Handler
    doc?: any
    middleware?: Handler[]
}

export declare type RouteMethod = "get" | "post" | "put" | "delete" | "head" | "patch" | "options"

export declare class Route {
    constructor(
        method: RouteMethod,
        path: string,
        controller: Handler | BaseController,
        routeParams?: IRouteParams
    )

    static get(
        path: string,
        controller: BaseController | Handler | string,
        options?: IRouteParams
    ): Route

    static post(
        path: string,
        controller: BaseController | Handler | string,
        options?: IRouteParams
    ): Route

    static put(
        path: string,
        controller: BaseController | Handler | string,
        options?: IRouteParams
    ): Route

    static delete(
        path: string,
        controller: BaseController | Handler | string,
        options?: IRouteParams
    ): Route

    static head(
        path: string,
        controller: BaseController | Handler | string,
        options?: IRouteParams
    ): Route

    static patch(
        path: string,
        controller: BaseController | Handler | string,
        options?: IRouteParams
    ): Route

    static options(
        path: string,
        controller: BaseController | Handler | string,
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

export declare function subroute(
    path: string, router: IExpressiveRouter, options?: ISubrouteOptions
): ISubroute

export declare interface IExpressiveRouter {
    routes?: Route[]
    subroutes?: typeof subroute[]
}

export interface IExpressiveOptions {
    basePath?: string;
    showSwaggerOnlyInDev?: boolean;
    swaggerInfo?: ISwaggerInfo;
    swaggerDefinitions?: any;
    allowCors: boolean
    corsConfig: CorsOptions
    middleware: Handler[]
    authorizer: Handler
    errorHandler: Handler
    bodyLimit: string
    helmetOptions: IHelmetConfiguration
}

export declare class ExpressApp {
    constructor(router: IExpressiveRouter, options?: IExpressiveOptions)
    express: Express
    listen(port: number, cb: Function): void
}

export declare interface Expressive {
    ExpressApp: ExpressApp
    // RouteUtil:
    // SwaggerUtils,
    Route: Route
    subroute: typeof subroute
    // serverless,
    BaseController: BaseController
    // expressValidator,
    // SwaggerBuilder
}
