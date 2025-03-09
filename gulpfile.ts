import { src, dest, series, watch } from "gulp";
import ts from "gulp-typescript";

function buildTypescript() {
  const project = ts.createProject("tsconfig.json");
  return project.src().pipe(project()).js.pipe(dest("dist/"));
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

const buildLib = series(buildLibBootstrap, buildLibSocketIo);

watch(
  ["src/**/*"],
  { events: "all" },
  series(buildLib, buildStatic, buildTypescript)
);

export default () => {
  console.log("gulp is now running");
};
