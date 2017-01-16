'use strict';

function isValidFlowStatus(status, threwError) {
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
