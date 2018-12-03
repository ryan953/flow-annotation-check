'use strict';

/**
 * @flow
 */

import type {
  FlowStatus,
  StatusEntry,
  StatusReportSummary,
} from './types';

function countByStatus(files: Array<StatusEntry>, status: FlowStatus): number {
  return files.filter((entry) => entry.status === status).length;
}

function summarizeReport(
  files: Array<StatusEntry>,
): StatusReportSummary {
  return {
    flow: countByStatus(files, 'flow'),
    flowstrict: countByStatus(files, 'flow strict'),
    flowstrictlocal: countByStatus(files, 'flow strict-local'),
    flowweak: countByStatus(files, 'flow weak'),
    noflow: countByStatus(files, 'no flow'),
    total: files.length,
  };
}

export default summarizeReport;
