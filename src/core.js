'use strict';

/**
 * @flow
 */

type NestedArray<T> = Array<T | NestedArray<T>>

function flatten<T>(arrays: NestedArray<T>): Array<T> {
  // $FlowFixMe: See https://github.com/facebook/flow/issues/2333
  return [].concat.apply([], arrays);
}

function unique<T>(array: Array<T>): Array<T> {
  return Array.from(new Set(array));
}

export {
  flatten,
  unique,
};
