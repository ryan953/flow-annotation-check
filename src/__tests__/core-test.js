'use strict';

/**
 * @flow
 */

import {flatten, unique} from '../core';

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

describe('unique', () => {
  it('should return unique items in an array of scalars', () => {
    expect(unique(['one', 'three', 'two', 'three'])).toEqual(['one', 'three', 'two']);
  });

  it('should not return stringified scalars', () => {
    expect(unique(['one', 3, 2, 3])).toEqual(['one', 3, 2]);
  });

  it('should not call toString on objects', () => {
    const myObject = {
      toString() {
        return 'myObject';
      },
    };
    expect(unique([myObject, 'one', myObject])).toEqual([myObject, 'one']);
  });
});
