'use strict';

/**
 * @flow
 */

function flatten<T>(arrays: Array<T | Array<any>>): Array<T> {
  return [].concat.apply([], arrays);
}

function toArray<T>(arg: any): Array<T> {
  return [].concat(arg).filter(_ => _);
}

function unique(array: Array<any>): Array<string> {
  const obj = {};
  array.forEach((item) => { obj[item] = true; });
  return Object.keys(obj);
}

export {
  flatten,
  toArray,
  unique,
};
