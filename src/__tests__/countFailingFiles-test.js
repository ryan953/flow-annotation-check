'use strict';

/**
 * @flow
 */

import countFailingFiles from '../countFailingFiles';
import {DEFAULT_FLAGS} from '../types';

describe('countFailingFiles', () => {
  const report = {
    files: [],
    summary: {
      noflow: 1,
      flowweak: 2,
      flow: 4,
      flowstrictlocal: 8,
      flowstrict: 16,
      total: 31,
    },
  };

  [
    ['any', 0],
    ['flowweak', 1],
    ['flow', 3],
    ['flowstrictlocal', 7],
    ['flowstrict', 15],
  ].forEach((fixture) => {
    const [level, expected] = fixture;
    it(`should return ${expected} for level=${level}`, () => {
      const flags = {...DEFAULT_FLAGS, level: level};
      expect(countFailingFiles(report, flags)).toBe(expected);
    });
  });

  it('should return 0 for invalid level values', () => {
    const flags = {...DEFAULT_FLAGS, level: 'unknown'};
    // $FlowExpectedError: Overriding for test coverage
    expect(countFailingFiles(report, flags)).toBe(0);
  });
});
