const express = require("express");
const { Joi, isCelebrate: isValidationError } = require("celebrate");
const celebrate = require("celebrate");
const ExpressApp = require("./ExpressApp");
const RouteUtil = require("./RouteUtil");
const SwaggerUtils = require("./SwaggerUtils");
const Route = require("./Route");
const subroute = require("./subroute");
const BaseController = require("./BaseController");
const SwaggerBuilder = require("./SwaggerBuilder");

const Expressive = {
    ExpressApp,
    RouteUtil,
    Route,
    subroute,
    BaseController,
    SwaggerUtils,
    SwaggerBuilder,
    express,
    Joi,
    isValidationError,
    celebrate
};

module.exports = Expressive;
