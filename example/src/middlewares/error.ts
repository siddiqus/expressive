import { ErrorRequestHandler } from "../../../src";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  res.status(500).json({
    message: err.message
  });

  next()
}