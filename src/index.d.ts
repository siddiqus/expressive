import { CorsOptions as CorsLibOptions } from 'cors';
import type {
  ErrorRequestHandler as ExpressErrorRequestHandler,
  Express as ExpressType,
  NextFunction as ExpressNextFunction,
  Response as ExpressResponse
} from 'express';

import type {
  ParamsDictionary as CoreParamsDictionary,
  Params as CoreParams,
  Query as CoreQuery,
  Request as CoreRequest
} from 'express-serve-static-core';

import { IHelmetConfiguration as HelmetConfig } from 'helmet';

export declare type express = typeof import('express');

interface Request<
  P extends CoreParams = CoreParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = CoreQuery
  > extends CoreRequest<P, ResBody, ReqBody, ReqQuery> {
  file: any;
  files: any[];
  authorizer?: AuthorizerType;
  user?: any;
  permissions?: any;
  id: string
}

export type Response = ExpressResponse;
export type NextFunction = ExpressNextFunction;

export interface Handler<
  T extends CoreParams = CoreParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = CoreQuery
  > {
  (
    req: Request<T, ResBody, ReqBody, ReqQuery>,
    res: ExpressResponse<ResBody>,
    next: NextFunction
  ): any;
}

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

interface ResponseMap {
  [key: number]: object;
}

export declare interface SwaggerEndpointDoc {
  description?: string;
  summary?: string;
  responses?: ResponseMap;
  tags?: string[];
}

type AuthorizerType = Handler | Handler[] | string | string[] | object | object[];

export declare interface IRouteParams {
  controller: string | Handler | typeof BaseController;
  validationSchema?: ValidationSchema;
  authorizer?: AuthorizerType;
  doc?: SwaggerEndpointDoc;
  middleware?: Handler[];
}

export declare type RouteMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'patch'
  | 'options';

export declare interface IEndpoint extends IRouteParams {
  method: RouteMethod;
  path: string;
}

export declare type IRouteProps = Omit<IRouteParams, 'controller'>;

export declare class Route {
  static get(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: IRouteProps
  ): IEndpoint;
  static get(path: string, params?: IRouteParams): IEndpoint;

  static post(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: IRouteProps
  ): IEndpoint;
  static post(path: string, params?: IRouteParams): IEndpoint;

  static delete(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: IRouteProps
  ): IEndpoint;
  static delete(path: string, params?: IRouteParams): IEndpoint;

  static put(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: IRouteProps
  ): IEndpoint;
  static put(path: string, params?: IRouteParams): IEndpoint;

  static head(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: IRouteProps
  ): IEndpoint;
  static head(path: string, params?: IRouteParams): IEndpoint;

  static options(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: IRouteProps
  ): IEndpoint;
  static options(path: string, params?: IRouteParams): IEndpoint;

  static patch(
    path: string,
    controller: string | Handler | typeof BaseController,
    params?: IRouteProps
  ): IEndpoint;
  static patch(path: string, params?: IRouteParams): IEndpoint;
}

export declare interface ISubroute {
  path: string;
  router: ExpressiveRouter;
  authorizer?: AuthorizerType;
  middleware?: Handler[];
  validationSchema?: ValidationSchema;
}

export declare function subroute(
  path: string,
  router: ExpressiveRouter,
  options: Pick<ISubroute, 'authorizer' | 'middleware' | 'validationSchema'>
): ISubroute

export declare interface ExpressiveRouter {
  routes?: IEndpoint[];
  subroutes?: ISubroute[];
}

export interface ExpressiveOptions {
  basePath?: string;
  showSwaggerOnlyInDev?: boolean;
  swaggerInfo?: SwaggerInfo;
  swaggerDefinitions?: any;
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
