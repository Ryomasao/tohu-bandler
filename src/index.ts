import { writeFileSync } from "fs";
import { getAllDependencies, bundle } from "./utils";

/**
 * 本体
 */
const main = () => {
  const entryPoint = process.argv[2] as string;
  const allFiles = getAllDependencies(entryPoint);
  const bundled = bundle(allFiles);
  writeFileSync("test.js", bundled, "utf8");
};

main();
