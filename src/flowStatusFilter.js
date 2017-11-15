'use strict';

/**
 * @flow
 */

import type {FlowStatus, StatusReport, VisibileStatusType} from './types';

export type EntryFilter = (entry: Object) => boolean;

export default function makeStatusFilter(
  visibleStatus: VisibileStatusType,
  allowWeak: boolean,
): EntryFilter {
  return (entry) => {
    switch (visibleStatus) {
      case 'all':
        return true;
      case 'flow':
        return allowWeak
          ? entry.status === 'flow strict' || entry.status === 'flow' || entry.status === 'flow weak'
          : entry.status === 'flow strict' || entry.status === 'flow' ;
      case 'noflow':
        return allowWeak
          ? entry.status === 'no flow'
          : entry.status === 'no flow' || entry.status === 'flow weak';
      case 'flowweak':
        return entry.status === 'flow weak';
      case 'flowstrict':
        return entry.status === 'flow strict';
      case 'none':
        return false;
    }
  };
}
