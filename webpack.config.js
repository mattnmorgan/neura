const glob = require("glob");

const isProduction = process.env.NODE_ENV == "production";

module.exports = {
  default: {
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? undefined : "source-map",
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
