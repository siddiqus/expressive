

module.exports.getServerlessHandler = function getServerlessHandler(expressApp, serverlessHttp, logger = null) {
    return (event, context, callback) => {
        if (event.source === "serverless-plugin-warmup") {
            if (logger) logger.info("WarmUP - Lambda is warm!");
            return callback(null, "Lambda is warm!");
        }

        return serverlessHttp(expressApp, {
            request: (req, event, context) => {
                req.apiGatewayEvent = event;
                req.apiGatewayContext = context;
            }
        })(event, context, callback);
    }
}
