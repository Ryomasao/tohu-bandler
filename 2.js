const needModules = {
  "foo.js": {
    foo: () => {
      return bar();
    },
    foo2: () => {
      return bar();
    },
    foo3: "hello",
  },
};

const modules = new Map();

const define = (name, factory) => {
  modules.set(name, factory);
};

define("foo.js", () => {
  module.set("foo.js");
});

const main = () => {
  modules["foo.js."].foo();
};

main();
