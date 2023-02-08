const exports = {};
exports["target/bar.js"] = {};
exports["target/baz.js"] = {};
exports["target/bar.js"] = {};
exports["target/foo.js"] = {};
exports["target/entry.js"] = {};
exports["target/bar.js"].bar = () => {
  return "im bar";
};

exports["target/baz.js"].baz = "baz";

exports["target/foo.js"].foo = () => {
  return exports["target/bar.js"].bar();
};

const main = () => {
  console.log(exports["target/foo.js"].foo());
  console.log(exports["target/bar.js"].bar());
  console.log(exports["target/baz.js"].baz);
};

main();
