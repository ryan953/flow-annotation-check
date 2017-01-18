'use strict';

/**
 * @flow
 */

const {flatten, toArray, unique} = require('../core');

describe('flatten', () => {
  it('should flatten two arrays', () => {
    expect(
      flatten([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toEqual(
      [1, 2, 3, 4, 5, 6]
    );
  });

  it('should not merge more nested arrays', () => {
    expect(
      flatten([
        [1, [2, 3]],
        [
          [4, 5, 6,]
        ],
      ])
    ).toEqual(
      [1, [2, 3], [4, 5, 6]],
    );
  });
});

describe('toArray', () => {
  it('takes a param and makes it an array', () => {
    expect(toArray(null)).toEqual([]);
    expect(toArray([])).toEqual([]);
    expect(toArray(1)).toEqual([1]);
    expect(toArray('foo')).toEqual(['foo']);
  });

  it('removed falsy values from the array', () => {
    expect(toArray([1, null, 3])).toEqual([1, 3]);
  });
});

describe('unique', () => {
  it('should return unique items in an array of scalars', () => {
    expect(unique(['one', 'three', 'two', 'three'])).toEqual(['one', 'three', 'two']);
  });

  it('should return stringified scalars', () => {
    expect(unique(['one', 3, 2, 3])).toEqual(['2', '3', 'one']);
  });

  it('should call toString on objects', () => {
    const myObject = {
      toString() {
        return 'myObject';
      },
    };
    expect(unique([{}, [], myObject])).toEqual(['[object Object]', '', 'myObject']);
  });
});
