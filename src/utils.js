function flatten(arrays) {
  return [].concat.apply([], arrays);
}

function toArray(arg) {
  return [].concat(arg).filter(_ => _);
}

function unique(array) {
  const obj = {};
  array.forEach((item) => { obj[item] = true; });
  return Object.keys(obj);
}

module.exports = {
  flatten,
  toArray,
  unique,
};
