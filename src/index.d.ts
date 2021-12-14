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

interface BaseController {
  validationSchema?: ValidationSchema;
  authorizer?: AuthorizerType;
  doc?: SwaggerEndpointDoc;
  middleware?: Handler[];
  pre?: Handler | Handler[];
  basePath?: string;
}

export declare abstract class BaseController {
  static responseMapper(data: any): any;
  static requestMapper(data: any): any;

  handleRequest(): Promise<void>;

  req: Request;
  res: Response;
  next: NextFunction;

  getData(): {
    body: Record<string, any>
    query: Record<string, any>
    params: Record<string, any>
    fileUpload: {
      file: any
      files: any
    }
    user: Record<string, any>
  };

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

export declare type RouteMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'patch'
  | 'options';

export declare interface Endpoint {
  controller: BaseController;
  method: RouteMethod;
  path: string;
}

export declare class Route {
  static get(
    path: string,
    controller: BaseController
  ): Endpoint;

  static post(
    path: string,
    controller: BaseController
  ): Endpoint;

  static delete(
    path: string,
    controller: BaseController
  ): Endpoint;

  static put(
    path: string,
    controller: BaseController
  ): Endpoint;

  static head(
    path: string,
    controller: BaseController
  ): Endpoint;

  static options(
    path: string,
    controller: BaseController
  ): Endpoint;

  static patch(
    path: string,
    controller: BaseController
  ): Endpoint;
}

export declare interface Subroute {
  path: string;
  controller: BaseController;
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
  errorHandler?: ErrorRequestHandler | ErrorRequestHandler[];
  bodyLimit?: string;
  helmetOptions?: HelmetConfiguration;
  celebrateErrorHandler?: ErrorRequestHandler;
  notFoundHandler?: Handler;
  authObjectHandler?: Handler;
}

export declare class ExpressApp {
  constructor(rootController: BaseController, options?: ExpressiveOptions);
  express: Express;
  listen(port: number, cb: Function): void;
}
