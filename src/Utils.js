module.exports = {
  normalizePathSlashes(path) {
    let normalizedPath = path;
    if (path && path.charAt(path.length - 1) !== '/') {
      normalizedPath = `${path}/`;
    }
    normalizedPath = normalizedPath.replace(/\/\//g, '/');
    return normalizedPath;
  },
  clearNullValuesInObject(obj) {
    Object.keys(obj).forEach(
      (key) => (obj[key] === undefined || obj[key] === null) && delete obj[key]
    );
  }
};
