'use strict';

/**
 * @flow
 */

import type {
  FlowStatus,
  Level,
  StatusEntry,
  StatusReport,
  VisibileStatusType
} from './types';

export type EntryFilter = (entry: StatusEntry) => boolean;

export default function makeStatusFilter(
  visibleStatus: VisibileStatusType,
  level: Level,
): EntryFilter {
  return (entry) => {
    switch (visibleStatus) {
      case 'all':
        return true;
      case 'flow':
        const isFlowOrBetter = entry.status === 'flow strict'
          || entry.status === 'flow strict-local'
          || entry.status === 'flow';
        return level === 'flowweak'
          ? isFlowOrBetter || entry.status === 'flow weak'
          : isFlowOrBetter;
      case 'noflow':
        return level === 'flowweak'
          ? entry.status === 'no flow'
          : entry.status === 'no flow' || entry.status === 'flow weak';
      case 'flowweak':
        return entry.status === 'flow weak';
      case 'flowstrict':
        return entry.status === 'flow strict' || entry.status === 'flow strict-local';
      case 'none':
        return false;
      default:
        return true;
    }
  };
}
