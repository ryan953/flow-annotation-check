'use strict';

/**
 * @flow
 */

import {
  asSummary,
  asText,
  asHTMLTable,
  asCSV,
  asJUnit,
  asJSON,
} from '../printStatusReport';

import os from 'os';

const EMPTY_REPORT = {
  summary: {
    flow: 0,
    flowstrict: 0,
    flowstrictlocal: 0,
    flowweak: 0,
    noflow: 0,
    total: 0,
  },
  files: [],
}
const BASIC_REPORT = {
  summary: {
    flow: 1,
    flowstrict: 1,
    flowstrictlocal: 1,
    flowweak: 1,
    noflow: 1,
    total: 5,
  },
  files: [
    {status: 'flow strict', file: './s.js'},
    {status: 'flow strict-local', file: './sl.js'},
    {status: 'flow', file: './a.js'},
    {status: 'flow weak', file: './b.js'},
    {status: 'no flow', file: './c.js'},
  ],
};

const returnTrue = jest.fn();

describe('printStatusReport', () => {
  beforeEach(() => {
    returnTrue.mockReset();
    returnTrue.mockReturnValue(true);
  });

  describe('asSummary', () => {
    it('should print only a summarized text report', () => {
      expect(asSummary(BASIC_REPORT)).toMatchSnapshot();
    });
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
      expect(returnTrue).toHaveBeenCalledTimes(BASIC_REPORT.files.length);
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
      expect(returnTrue).toHaveBeenCalledTimes(BASIC_REPORT.files.length);
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
      expect(returnTrue).toHaveBeenCalledTimes(BASIC_REPORT.files.length);
    });

    it('should print an empty html-table report', () => {
      expect(asHTMLTable(EMPTY_REPORT, false, returnTrue)).toMatchSnapshot();
    });

    it('should print an html-table report with even percentages', () => {
      const report = {
        summary: {
          flow: 1,
          flowstrict: 1,
          flowstrictlocal: 0,
          flowweak: 1,
          noflow: 1,
          total: 4,
        },
        files: [
          {status: 'flow', file: './a.js'},
          {status: 'flow strict', file: './s.js'},
          {status: 'flow weak', file: './b.js'},
          {status: 'no flow', file: './b.js'},
        ],
      };
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
      expect(returnTrue).toHaveBeenCalledTimes(BASIC_REPORT.files.length);
    });
  });

  describe('asJSON', () => {
    it('should print a JSON blob', () => {
      expect(asJSON(BASIC_REPORT)).toMatchSnapshot();
    });
  });
});
