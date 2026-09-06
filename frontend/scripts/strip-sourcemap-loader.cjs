module.exports = function stripSourceMapLoader(source) {
  if (typeof source !== "string") return source;
  return source.replace(/\/\/#\s*sourceMappingURL=[^\r\n]+\.map/g, "");
};
