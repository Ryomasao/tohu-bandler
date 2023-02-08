const modules = { bar: wrapper };

function wrapper(module, exports) {
  exports.bar = () => {
    return "im bar";
  };
  exports.foo = () => {
    return modules["src/bar.js"].bar();
  };
  exports.baz = "baz";
}

exports.foo2 = () => {
  return "hello";
};

exports.foo3 = "foo3";

const main = () => {
  modules["src/foo.js"].foo();
  modules["src/bar.js"].bar();
  console.log(modules["src/baz.js"].baz);
};

main();
