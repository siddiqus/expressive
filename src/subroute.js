module.exports = (
  path,
  router,
  { authorizer, middleware, validationSchema } = {}
) => {
  return {
    path,
    router,
    authorizer,
    validationSchema,
    middleware: middleware || []
  };
};
