import { src, dest, series, watch } from "gulp";
import ts from "gulp-typescript";
import webpackstream from "webpack-stream";
import { rmSync } from "fs";
import { sync } from "glob";

function cleanDist(cb) {
  rmSync("dist/client", { recursive: true, force: true });
  rmSync("dist/server", { recursive: true, force: true });
  cb();
}

function buildLibBootstrap() {
  return src([
    "node_modules/bootstrap/dist/css/*.min.css",
    "node_modules/bootstrap/dist/js/*.min.js",
  ]).pipe(dest("dist/client/lib/bootstrap/"));
}

function buildLibSocketIo() {
  return src(["node_modules/socket.io-client/dist/*.min.js"]).pipe(
    dest("dist/client/lib/socket-io/")
  );
}

function buildStatic() {
  return src(["src/client/", "src/client/**/*.!(ts)"]).pipe(
    dest("dist/client/")
  );
}

function buildTypescript() {
  const project = ts.createProject("tsconfig.json");
  return project.src().pipe(project()).js.pipe(dest("dist/"));
}

function packTypescript() {
  return src("dist/client/js/**/*.js")
    .pipe(webpackstream(require("./webpack.config.js").default))
    .pipe(dest("dist/client/js/"));
}

function cleanTypescript(cb) {
  sync(["dist/client/js/**/*.js"], {
    ignore: ["dist/client/js/bundle.js"],
  })
    .reduce((prior, file) => {
      let dir = file;
      let bits: string[];

      while (dir.includes("\\")) {
        dir = dir.replace("\\", "/");
      }

      bits = dir.split("/");
      bits.splice(bits.length - 1, 1);
      dir = bits.join("/");

      // Delete files and subdirectories in dist/client/js
      if (dir.split("/").length == 3) {
        prior.push(file);
      } else if (!prior.includes(dir)) {
        prior.push(dir);
      }

      return prior;
    }, [] as string[])
    .forEach((file) => {
      console.log(file);
      rmSync(file, { recursive: true, force: true });
    });
  cb();
}

const build = series(
  cleanDist,
  buildLibBootstrap,
  buildLibSocketIo,
  buildStatic,
  buildTypescript,
  packTypescript,
  cleanTypescript
);

watch(["src/**/*"], { events: "all" }, build);

export default build;
