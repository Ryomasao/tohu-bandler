exports.bar = () => {
  return "im bar";
};

exports.baz = "baz";



exports.foo = () => {
  return modules['target/bar.js'].bar();
};

exports.foo2 = () => {
  return "hello";
};

exports.foo3 = "foo3";





const main = () => {
  modules['target/foo.js'].foo();
  modules['target/bar.js'].bar();
  console.log(modules['target/baz.js'].baz);
};

main();
