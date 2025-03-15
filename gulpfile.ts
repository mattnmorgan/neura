import { src, dest, series, watch } from "gulp";
import ts from "gulp-typescript";
import webpackstream from "webpack-stream";
import { rmSync, existsSync, readFileSync } from "fs";
import { sync } from "glob";
import through from "through2";
import { execSync } from "child_process";

function cleanDist(cb) {
  rmSync("dist/client", { recursive: true, force: true });
  rmSync("dist/server", { recursive: true, force: true });
  cb();
}

function buildLibShoelace() {
  return src(["node_modules/@shoelace-style/shoelace/dist/**/*.css"]).pipe(
    dest("dist/client/lib/shoelace")
  );
}

function buildLibTailwind(cb) {
  execSync("npm run tailwind:compile");
  cb();
}

function buildStatic() {
  return src(["src/client/", "src/client/**/*.!(ts|css)"]).pipe(
    dest("dist/client/")
  );
}

function buildTypescript() {
  const project = ts.createProject("tsconfig.json");
  return project
    .src()
    .pipe(
      through.obj((chunk, enc, cb) => {
        const cwd = chunk.cwd.replaceAll("\\", "/");
        const chunkPath: string[] = chunk.path.replaceAll("\\", "/").split("/");
        const chunkDir = chunkPath.slice(0, chunkPath.length - 1).join("/");
        const htmlPath =
          chunkDir +
          "/" +
          chunkPath[chunkPath.length - 1].replace(".ts", ".html");

        if (/src\/.*?\/elements\/?.*?/.test(chunkDir)) {
          if (existsSync(htmlPath)) {
            const className: string = chunkPath[chunkPath.length - 1].replace(
              ".ts",
              ""
            );
            let code: string = new TextDecoder("UTF-8").decode(
              Buffer.from(chunk._contents)
            );
            let html: string =
              "`" + readFileSync(htmlPath).toString().trim() + "`";

            if (new RegExp(`class\\s+${className}`).test(code)) {
              code += `\nimport { html as _html } from "lit";\nObject.defineProperty(${className}.prototype, 'template', { get: function() { return _html${html}; }, configurable: false, enumerable: true });`;
              chunk._contents = Buffer.from(new TextEncoder().encode(code));
              console.log("Success: " + htmlPath.substring(cwd.length));
            } else {
              console.warn(
                `Invalid class declaration for injecting template "${htmlPath.substring(
                  cwd.length
                )}"`
              );
            }
          } else {
            console.warn(
              `No template found for element at "${htmlPath.substring(
                cwd.length
              )}"`
            );
          }
        }

        cb(null, chunk);
      })
    )
    .pipe(project())
    .js.pipe(dest("dist/"));
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
  buildLibShoelace,
  buildLibTailwind,
  buildStatic,
  buildTypescript,
  packTypescript,
  cleanTypescript
);

watch(["src/**/*"], { events: "all" }, build);

export default build;
