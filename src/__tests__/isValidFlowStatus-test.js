'use strict';

/**
 * @flow
 */

import isValidFlowStatus from '../isValidFlowStatus';

function assertFixture(fixture) {
  expect(
    isValidFlowStatus(fixture.status, fixture.fileErrored)
  ).toBe(fixture.expected);
}

describe('isValidFlowStatus', () => {
  const passThruFixtures = [
    {status: 'flow', fileErrored: false, expected: false},
    {status: 'flow', fileErrored: true, expected: true},
    {status: 'flow weak', fileErrored: false, expected: false},
    {status: 'flow weak', fileErrored: true, expected: true},
  ];

  passThruFixtures.forEach((fixture) => {
    it('should pass the value of fileError through when a flow-annotation is present', () => {
      assertFixture(fixture);
    });
  });

  it('should return true when the @flow annotation is not present because files should not error', () => {
    assertFixture({status: 'no flow', fileErrored: false, expected: true});
  });

  it('should return false when the @flow annotation is not present because this file errored when it should not have', () => {
    assertFixture({status: 'no flow', fileErrored: true, expected: false});
  });

  it('should throw when the annotation is some unexpected value', () => {
    // $FlowFixMe expected that foobar is not in enum 'flow' | 'flow weak' | 'no flow'
    expect(() => isValidFlowStatus('foobar')).toThrow(`Invalid flow status 'foobar'`);
  });
});
