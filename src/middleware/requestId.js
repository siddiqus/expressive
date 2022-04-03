const uuid = require('uuid').v4;
const headerName = 'X-Request-Id';

module.exports = function requestId() {
  return (req, res, next) => {
    const oldValue = req.get(headerName);
    const id = oldValue || uuid();

    res.set(headerName, id);

    req.id = id;

    next();
  };
};
