'use strict';

/**
 * @flow
 */

import {
  asText,
  asHTMLTable,
  asCSV,
  asJUnit,
} from '../printStatusReport';

import os from 'os';

const BASIC_REPORT = [
  {status: 'flow', file: './a.js'},
  {status: 'flow weak', file: './b.js'},
  {status: 'no flow', file: './c.js'},
];

describe('printStatusReport', () => {
  describe('asText', () => {
    it('should print a simple text report', () => {
      expect(asText(BASIC_REPORT, false)).toMatchSnapshot();
    });

    it('should print a summarized text report', () => {
      expect(asText(BASIC_REPORT, true)).toMatchSnapshot();
    });
  });

  describe('asCSV', () => {
    it('should print a simple csv report', () => {
      expect(asCSV(BASIC_REPORT, false)).toMatchSnapshot();
    });

    it('should print a summarized csv report', () => {
      expect(asCSV(BASIC_REPORT, true)).toMatchSnapshot();
    });
  });

  describe('asHTMLTable', () => {
    it('should print a simple html-table report', () => {
      expect(asHTMLTable(BASIC_REPORT, false)).toMatchSnapshot();
    });

    it('should print a summarized html-table report', () => {
      expect(asHTMLTable(BASIC_REPORT, true)).toMatchSnapshot();
    });

    it('should print an empty html-table report', () => {
      const report = [];
      expect(asHTMLTable(report, false)).toMatchSnapshot();
    });

    it('should print an html-table report with even percentages', () => {
      const report = [
        {status: 'flow', file: './a.js'},
        {status: 'flow weak', file: './b.js'},
      ];
      expect(asHTMLTable(report, false)).toMatchSnapshot();
    });
  });

  describe('asJUnit', () => {
    beforeEach(() => {
      // Needed for jUnit tests
      global.Date = jest.fn(() => ({
        toISOString: () => '-mock date-',
      }));
      os.hostname = jest.fn(() => 'test-host');
    });

    it('should print a jUnit compatible report', () => {
      expect(asJUnit(BASIC_REPORT)).toMatchSnapshot();
    });
  });
});
