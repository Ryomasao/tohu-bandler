const bar = () => {
  return "im bar";
};

const baz = "baz";

const foo = () => {
  return bar();
};

/**
 * {moduleName: fn}マップ
 */
const modules = new Map();
/**
 * defineはマップに登録するだけ
 */
const define = (name, factory) => {
  modules.set(name, factory);
};

const requireModule = (name) => {
  if (!modules.has(name)) {
    throw new Error(`Module '${name}' does not exist.`);
  }
  const moduleFactory = modules.get(name);
  const module = {
    exports: {},
  };
  moduleFactory(module, module.exports, requireModule);
};

const moduleCache = new Map();

define("baz.js", function (module, exports, require) {
  module.exports = {
    baz: "baz",
  };
});

define(
  // name
  "bar.js",
  // factory
  function (module, exports, require) {
    exports = {
      bar: () => {
        return "im bar";
      },
    };
  }
);

define("foo.js", function (module, exports, require) {
  module.exports = {
    foo: () => {
      return require("bar.js");
    },
  };
});

const main = () => {
  foo();
  bar();
  console.log(baz);
};

main();
