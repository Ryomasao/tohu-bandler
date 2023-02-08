import { writeFileSync } from "fs";
import { getAllDependencies, bundle } from "./utils";

const main = () => {
  const entryPoint = process.argv[2] as string;
  if (!entryPoint) throw new Error("エントリーポイントを指定してね。");

  const allFiles = getAllDependencies(entryPoint);

  const bundled = bundle(allFiles);

  writeFileSync("test.js", bundled, "utf8");
};

main();
