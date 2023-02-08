import { foo } from "./foo.js";
import { bar } from "./bar.js";
import { baz } from "./baz.js";

const main = () => {
  foo();
  bar();
  console.log(baz);
};

main();
