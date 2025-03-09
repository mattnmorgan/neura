const glob = require("glob");

module.exports = {
  default: {
    mode: "production",
    entry: "dist/client/js/index.js",
    output: {
      filename: "bundle.js",
      library: "morgantech",
      libraryTarget: "umd",
      umdNamedDefine: true,
    },
    resolve: {
      preferRelative: true,
    },
  },
};
