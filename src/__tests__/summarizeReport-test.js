'use strict';

/**
 * @flow
 */

import summarizeReport from '../summarizeReport';

describe('summarizeReport', () => {
  it('should count the files files', () => {
    const files = [
      {status: 'flow strict', file: './s.js'},
      {status: 'flow strict-local', file: './sl.js'},
      {status: 'flow', file: './a.js'},
      {status: 'flow weak', file: './b.js'},
      {status: 'no flow', file: './c.js'},
    ];
    expect(summarizeReport(files)).toEqual({
      flow: 1,
      flowstrict: 1,
      flowstrictlocal: 1,
      flowweak: 1,
      noflow: 1,
      total: files.length,
    });
  });

  it('should count 0 when there are no files', () => {
    expect(summarizeReport([])).toEqual({
      flow: 0,
      flowstrict: 0,
      flowstrictlocal: 0,
      flowweak: 0,
      noflow: 0,
      total: 0,
    });
  });
});
