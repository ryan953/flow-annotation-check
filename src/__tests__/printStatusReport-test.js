'use strict';

/**
 * @flow
 */

import {
  asText,
  asHTMLTable,
  asCSV,
} from '../printStatusReport';

const BASIC_REPORT = [
  {status: 'flow', file: './a.js'},
  {status: 'flow weak', file: './b.js'},
  {status: 'no flow', file: './c.js'},
];

describe('printStatusReport', () => {
  it('should print a simple text report', () => {
    expect(asText(BASIC_REPORT)).toMatchSnapshot();
  });
  it('should print a simple csv report', () => {
    expect(asCSV(BASIC_REPORT)).toMatchSnapshot();
  });
  it('should print a simple html-table report', () => {
    expect(asHTMLTable(BASIC_REPORT)).toMatchSnapshot();
  });
  it('should print an empty html-table report', () => {
    const report = [];
    expect(asHTMLTable(report)).toMatchSnapshot();
  });
  it('should print an html-table report with even percentages', () => {
    const report = [
      {status: 'flow', file: './a.js'},
      {status: 'flow weak', file: './b.js'},
    ];
    expect(asHTMLTable(report)).toMatchSnapshot();
  });
});
