'use strict';

/**
 * @flow
 */

import flowStatusFilter from '../flowStatusFilter';

const BASIC_REPORT = [
  {status: 'flow strict', file: './s.js'},
  {status: 'flow strict-local', file: './sl.js'},
  {status: 'flow', file: './a.js'},
  {status: 'flow weak', file: './b.js'},
  {status: 'no flow', file: './c.js'},
];

describe('flowStatusFilter', () => {
  it('should return all things when there is a weird status name', () => {
    // $FlowFixMe: Expected error with foobar input
    expect(BASIC_REPORT.filter(flowStatusFilter('foobar', 'flow'))).toHaveLength(5);
    // $FlowFixMe: Expected error with foobar input
    expect(BASIC_REPORT.filter(flowStatusFilter('foobar', 'flowweak'))).toHaveLength(5);
  });
  it('should keep all entries with the `all` filter', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('all', 'flow'))).toHaveLength(5);
  });

  it('should remove all entries with the `none` filter', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('none', 'flow'))).toHaveLength(0);
  });

  it('should keep only the flow-strict & flow-strict-local files when flowstrict is used', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('flowstrict', 'flow'))).toHaveLength(2);
    expect(BASIC_REPORT.filter(flowStatusFilter('flowstrict', 'flowweak'))).toHaveLength(2);
  });

  it('should keep only the flow, flow-strict & flow-strict-local files when allowWeak is false', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('flow', 'flow'))).toHaveLength(3);
  });

  it('should keep the flow, flow-strict, flow-strict-local and flow-weak files when allowWeak is true', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('flow', 'flowweak'))).toHaveLength(4);
  });

  it('should always only keep flow-weak files', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('flowweak', 'flow'))).toHaveLength(1);
    expect(BASIC_REPORT.filter(flowStatusFilter('flowweak', 'flowweak'))).toHaveLength(1);
  });

  it('should keep both the no-flow and flow-weak files when allowWeak is false', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('noflow', 'flow'))).toHaveLength(2);
  });

  it('should keep only the no-flow file when allowWeak is true', () => {
    expect(BASIC_REPORT.filter(flowStatusFilter('noflow', 'flowweak'))).toHaveLength(1);
  });
});
