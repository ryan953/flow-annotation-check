'use strict';

/**
 * @flow
 */

import type {
  Flags,
  StatusReport,
} from './types';

export default function countFailingFiles(
  report: StatusReport,
  flags: Flags,
): number {
  const {
    noflow,
    flowweak,
    flow,
    flowstrictlocal,
  } = report.summary;

  switch(flags.level) {
    case 'any':
      return 0;
    case 'flowweak':
      return noflow;
    case 'flow':
      return noflow + flowweak;
    case 'flowstrictlocal':
      return noflow + flowweak + flow;
    case 'flowstrict':
      return noflow + flowweak + flow + flowstrictlocal;
    default:
      return 0;
  }
}
