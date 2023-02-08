import path from "path";
import { readFileSync } from "fs";

type File = {
  fileName: string;
  code: string;
  dependencies: Dependencies[];
};

type Dependencies = {
  importName: string;
  path: string;
};

export const getAllDependencies = (entryFileName: string) => {
  const queue = [entryFileName];
  const allFiles = [];

  while (queue.length) {
    const target = queue.shift() as string;
    const code = readFileSync(target, "utf8");
    const dirname = path.dirname(target);
    const dependencies = _getDependencies(code, dirname);

    queue.push(...dependencies.map((d) => d.path));

    allFiles.push({
      fileName: target,
      code,
      dependencies,
    });
  }
  return allFiles;
};

export const bundle = (files: File[]) => {
  const output = [];
  const cache = new Set();

  for (const file of files.reverse()) {
    if (cache.has(file.fileName)) continue;
    cache.add(file.fileName);
    output.push(_replaceNativeStatement(file));
  }

  const def = "const exports = {}\n";
  const init =
    files.map((f) => `exports['${f.fileName}'] = {}`).join("\n") + "\n";
  const code = output.join("\n");
  return def.concat(init).concat(code);
};

/**
 * 引数に指定したソースコードからimportしているモジュール名を取得する。
 */
const _getDependencies = (code: string, basePath: string) => {
  const dependencies: Dependencies[] = [];
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
 * import/exportをブラウザが解釈できる形に置換する
 */
const _replaceNativeStatement = (file: File) => {
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
      let nLine = line.replace(
        /export const (.*) = (.*)/,
        `exports['${file.fileName}'].$1 = $2`
      );

      if (importNames.length === 0) return nLine;

      // dependenciesのimportNameが利用されている場合、置き換え
      const extractRefModule = nLine.match(regexPattern);
      if (extractRefModule) {
        const refName = extractRefModule[1].trim();
        const moduleName = file.dependencies.find(
          (d) => d.importName === refName
        )?.path;

        nLine = nLine.replace(
          regexPattern,
          `exports['${moduleName}'].${refName}`
        );
      }
      return nLine;
    })
    .join("\n");
};
