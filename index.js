import path from "path";
import { writeFileSync, readFileSync } from "fs";

/**
 * 引数に指定したソースコードからimportしているモジュール名を取得する。
 */
const getDependencies = (code, basePath) => {
  const dependencies = [];
  const lines = code.split("\n");

  for (const line of lines) {
    if (line === "") {
      break;
    }
    const extractImportStatement = line.match(/import {(.*)} from "(.*)";/);
    if (extractImportStatement) {
      const importName = extractImportStatement[1].trim();
      const modulePath = extractImportStatement[2];
      // 相対パスから絶対パスに変換する
      const absoluteModulePath = path.join(basePath, modulePath);
      dependencies.push({
        importName,
        path: absoluteModulePath,
      });
    }
  }
  return dependencies;
};

/**
 * 本体
 */
const entryPoint = process.argv[2];
let queue = [entryPoint];
const allFiles = [];

const getAllDependencies = () => {
  while (queue.length) {
    const target = queue.shift();
    const code = readFileSync(target, "utf8");
    const dirname = path.dirname(target);
    const dependencies = getDependencies(code, dirname);
    queue = [...queue, ...dependencies.map((d) => d.path)];
    allFiles.push({
      fileName: target,
      code,
      dependencies,
    });
  }
};

/**
 * import/exportをブラウザが解釈できる形に置換する
 */
const replaceNativeStatement = (file) => {
  const importNames = file.dependencies.map((d) => d.importName);
  // named importしている変数を取得するためのざっくり正規表現
  // eg) 拾える変数
  // foo foo()
  const regexString = `(${importNames.join("|")})(\(\))?`;
  const regexPattern = new RegExp(regexString);

  return file.code
    .split("\n")
    .map((line) => {
      // import statement
      if (line.startsWith("import")) {
        // import分を消す
        return line.replace(/import .* from "(.*)";/, "");
      }

      // import statement以外
      // exportを消す
      let nLine = line.replace(/export const (.*) = (.*)/, "exports.$1 = $2");

      if (importNames.length === 0) return nLine;

      // dependenciesのimportNameが利用されている場合、置き換え
      const extractRefModule = nLine.match(regexPattern);
      if (extractRefModule) {
        const refName = extractRefModule[1].trim();
        const moduleName = file.dependencies.find(
          (d) => d.importName === refName
        ).path;
        nLine = nLine.replace(
          regexPattern,
          `modules['${moduleName}'].${refName}`
        );
      }
      return nLine;
    })
    .join("\n");
};

const bundle = () => {
  const output = [];
  const cache = new Set();

  for (const file of allFiles.reverse()) {
    if (cache.has(file.fileName)) continue;
    cache.add(file.fileName);
    output.push(replaceNativeStatement(file));
  }

  return output.join("\n");
};

getAllDependencies();
const bundled = bundle();

writeFileSync("test.js", bundled, "utf8");
