import { CorsOptions as ICorsOptions } from "cors";
import {
    ErrorRequestHandler as IErrorRequestHandler,
    Express as IExpress,
    Handler as IHandler,
    NextFunction as INextFunction,
    Request as IRequest,
    Response as IResponse
} from "express";

import ExpressValidator from "express-validator";
import { ValidationChain as IValidationChain } from "express-validator"

import { IHelmetConfiguration as IHelmetConfigFromHelment } from "helmet";

export declare const expressValidator: typeof ExpressValidator

export declare interface Request extends IRequest { }
export declare interface Response extends IResponse { }
export declare interface NextFunction extends INextFunction { }
export declare interface Handler extends IHandler { }
export declare interface Express extends IExpress { }
export declare interface ErrorRequestHandler extends IErrorRequestHandler { }
export declare interface ValidationChain extends IValidationChain { }

export declare interface IHelmetConfiguration extends IHelmetConfigFromHelment { }
export declare interface CorsOptions extends ICorsOptions { }

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
    controller?: string | Handler | typeof BaseController
    validator?: ValidationChain[]
    authorizer?: Handler
    doc?: any
    middleware?: Handler[]
}

export declare type RouteMethod = "get" | "post" | "put" | "delete" | "head" | "patch" | "options"

export declare interface IEndpoint extends IRouteParams {
    method: RouteMethod
    path: string
}

export declare type RouteFn = (path: string,
    options?: IRouteParams
) => IEndpoint

export declare class Route {
    static get: RouteFn
    static post: RouteFn
    put: RouteFn
    delete: RouteFn
    head: RouteFn
    patch: RouteFn
    options: RouteFn
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
    corsConfig?: ICorsOptions
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

