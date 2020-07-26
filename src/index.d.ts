import { CorsOptions as CorsLibOptions } from 'cors';
import type {
  ErrorRequestHandler as ExpressErrorRequestHandler,
  Express as ExpressType,
  NextFunction as ExpressNextFunction,
  Response as ExpressResponse,
  Request as ExpressRequest,
  RequestHandler as ExpressHandler
} from 'express';

import { IHelmetConfiguration as HelmetConfig } from 'helmet';

export declare type express = typeof import('express');

interface Request extends ExpressRequest {
  authorizer?: AuthorizerType;
  user?: any;
  permissions?: any;
  id?: string
}

export type Response = ExpressResponse;
export type NextFunction = ExpressNextFunction;

export type Handler = ExpressHandler;

export type Express = ExpressType;
export type ErrorRequestHandler = ExpressErrorRequestHandler;

export type HelmetConfiguration = HelmetConfig;
export type CorsOptions = CorsLibOptions;

export declare const Joi: typeof import('celebrate').Joi;
export declare const isValidationError: typeof import('celebrate').isCelebrate;
export declare const celebrate: typeof import('celebrate');

export declare interface SwaggerInfoContact {
  name?: string;
  email?: string;
}

export declare interface SwaggerInfo {
  version?: string;
  title?: string;
  contact?: SwaggerInfoContact;
}

export declare class BaseController {
  static bodyWrapper(): any;

  handleRequest(): Promise<void> | void;

  req: Request;
  res: Response;
  next: NextFunction;

  ok(data?: any): void;

  created(data?: any): void;

  accepted(data?: any): void;

  noContent(): void;

  badRequest(message?: string): void;

  unauthorized(message?: string): void;

  forbidden(message?: string): void;

  notFound(message?: string): void;

  tooMany(message?: string): void;

  internalServerError(message?: string, body?: any): void;
}

type controller = string | Handler | typeof BaseController;

export declare interface ValidationSchema {
  body?: object;
  params?: object;
  query?: object;
  headers?: object;
  cookies?: object;
  signedCookies?: object;
  fileUpload?: {
    file?: object,
    files?: object
  }
}

interface SwaggerResponseMap {
  [key: number]: object;
}

export declare interface SwaggerEndpointDoc {
  description?: string;
  summary?: string;
  responses?: SwaggerResponseMap;
  tags?: string[];
}

type AuthorizerType = Handler | Handler[] | string | string[] | object | object[];

export declare interface RouteParams {
  controller: string | Handler | typeof BaseController;
  validationSchema?: ValidationSchema;
  authorizer?: AuthorizerType;
  doc?: SwaggerEndpointDoc;
  middleware?: Handler[];
  pre?: Handler | Handler[];
}

export declare type RouteMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'patch'
  | 'options';

export declare interface Endpoint extends RouteParams {
  method: RouteMethod;
  path: string;
}

export declare type RouteProps = Omit<RouteParams, 'controller'>;

export declare class Route {
  static get(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: RouteProps
  ): Endpoint;
  static get(path: string, params?: RouteParams): Endpoint;

  static post(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: RouteProps
  ): Endpoint;
  static post(path: string, params?: RouteParams): Endpoint;

  static delete(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: RouteProps
  ): Endpoint;
  static delete(path: string, params?: RouteParams): Endpoint;

  static put(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: RouteProps
  ): Endpoint;
  static put(path: string, params?: RouteParams): Endpoint;

  static head(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: RouteProps
  ): Endpoint;
  static head(path: string, params?: RouteParams): Endpoint;

  static options(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: RouteProps
  ): Endpoint;
  static options(path: string, params?: RouteParams): Endpoint;

  static patch(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: RouteProps
  ): Endpoint;
  static patch(path: string, params?: RouteParams): Endpoint;
}

export declare interface Subroute {
  path: string;
  router: ExpressiveRouter;
  authorizer?: AuthorizerType;
  middleware?: Handler[];
  validationSchema?: ValidationSchema;
  pre?: Handler | Handler[];
}

export declare function subroute(
  path: string,
  router: ExpressiveRouter,
  options: Pick<Subroute, 'authorizer' | 'middleware' | 'validationSchema'>
): Subroute

export declare interface ExpressiveRouter {
  routes?: Endpoint[];
  subroutes?: Subroute[];
}

export type SwaggerSecurityDefinitions = {
  [key in string]: {
    type: 'basic'
  } | {
    type: 'apiKey'
    in: 'header' | 'query'
    name: string
  } | {
    type: 'oauth2'
    flow: string
    authorizationUrl: string
    tokenUrl: string
    scopes: {
      [key in string]: string
    }
  }
}

export interface ExpressiveOptions {
  basePath?: string;
  showSwaggerOnlyInDev?: boolean;
  swaggerInfo?: SwaggerInfo;
  swaggerDefinitions?: any;
  swaggerBasicAuth?: {
    user: string;
    password: string;
  }
  swaggerSecurityDefinitions?: SwaggerSecurityDefinitions;
  allowCors?: boolean;
  corsConfig?: CorsOptions;
  middleware?: Handler[];
  authorizer?: AuthorizerType;
  errorHandler?: ErrorRequestHandler | ErrorRequestHandler[];
  bodyLimit?: string;
  helmetOptions?: HelmetConfiguration;
  celebrateErrorHandler?: ErrorRequestHandler;
  notFoundHandler?: Handler;
  authObjectHandler?: Handler;
}

export declare class ExpressApp {
  constructor(router: ExpressiveRouter, options?: ExpressiveOptions);
  express: Express;
  listen(port: number, cb: Function): void;
}
