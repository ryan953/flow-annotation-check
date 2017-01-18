'use strict';

/**
 * @flow
 */

import type {FlowStatus} from './types';

function isValidFlowStatus(
  status: FlowStatus,
  threwError: boolean,
): boolean {
  switch(status) {
    case 'flow':
      return threwError;
    case 'flow weak':
      return threwError;
    case 'no flow':
      return !threwError;
    default:
      throw new Error(`invalid flow status '${status}'`);
  };
}

module.exports = isValidFlowStatus;
