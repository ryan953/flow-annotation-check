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
  {status: 'flow strict', file: './s.js'},
  {status: 'flow strict-local', file: './sl.js'},
  {status: 'flow', file: './a.js'},
  {status: 'flow weak', file: './b.js'},
  {status: 'no flow', file: './c.js'},
];

const returnTrue = jest.fn();

describe('printStatusReport', () => {
  beforeEach(() => {
    returnTrue.mockReset();
    returnTrue.mockReturnValue(true);
  });

  describe('asText', () => {
    it('should print a simple text report', () => {
      expect(asText(BASIC_REPORT, false, returnTrue)).toMatchSnapshot();
    });

    it('should print a summarized text report', () => {
      expect(asText(BASIC_REPORT, true, returnTrue)).toMatchSnapshot();
    });

    it('should filtered the report based on status', () => {
      asText(BASIC_REPORT, true, returnTrue);
      expect(returnTrue).toHaveBeenCalledTimes(BASIC_REPORT.length);
    });
  });

  describe('asCSV', () => {
    it('should print a simple csv report', () => {
      expect(asCSV(BASIC_REPORT, false, returnTrue)).toMatchSnapshot();
    });

    it('should print a summarized csv report', () => {
      expect(asCSV(BASIC_REPORT, true, returnTrue)).toMatchSnapshot();
    });

    it('should filter the csv report', () => {
      asCSV(BASIC_REPORT, false, returnTrue);
      expect(returnTrue).toHaveBeenCalledTimes(BASIC_REPORT.length);
    });
  });

  describe('asHTMLTable', () => {
    it('should print a simple html-table report', () => {
      expect(asHTMLTable(BASIC_REPORT, false, returnTrue)).toMatchSnapshot();
    });

    it('should print a summarized html-table report', () => {
      expect(asHTMLTable(BASIC_REPORT, true, returnTrue)).toMatchSnapshot();
    });

    it('should filter the html-table report', () => {
      asHTMLTable(BASIC_REPORT, true, returnTrue);
      expect(returnTrue).toHaveBeenCalledTimes(BASIC_REPORT.length);
    });

    it('should print an empty html-table report', () => {
      const report = [];
      expect(asHTMLTable(report, false, returnTrue)).toMatchSnapshot();
    });

    it('should print an html-table report with even percentages', () => {
      const report = [
        {status: 'flow', file: './a.js'},
        {status: 'flow strict', file: './s.js'},
        {status: 'flow weak', file: './b.js'},
        {status: 'no flow', file: './b.js'},
      ];
      expect(asHTMLTable(report, false, returnTrue)).toMatchSnapshot();
    });
  });

  describe('asJUnit', () => {
    beforeEach(() => {
      global.Date = jest.fn(() => ({
        toISOString: () => '-mock date-',
      }));
      // $FlowExpectedError: Overriding for consistency across environments
      os.hostname = jest.fn(() => 'test-host');
    });

    it('should print a jUnit compatible report', () => {
      expect(asJUnit(BASIC_REPORT, returnTrue)).toMatchSnapshot();
    });

    it('should filter the jUnit report', () => {
      asJUnit(BASIC_REPORT, returnTrue);
      expect(returnTrue).toHaveBeenCalledTimes(BASIC_REPORT.length);
    });
  });
});
