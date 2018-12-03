'use strict';

/**
 * @flow
 */

import type {
  ErrorReport,
  Flags,
  FlowStatus,
  StatusEntry,
  StatusReport,
  StatusReportSummary,
  ValidationReport,
} from './types';

import globsToFileList from './globsToFileList';
import isValidFlowStatus from './isValidFlowStatus';
import summarizeReport from './summarizeReport';
import {asyncMap} from './promisified';
import {genCheckFlowStatus, genForceErrors} from './flow';

function genSummarizedReport(
  cwd: string,
  flags: Flags,
): Promise<StatusReport> {
  const files = globsToFileList(cwd, flags.include, flags.exclude, {
    absolute: flags.absolute,
  });

  return asyncMap(
    files,
    (file) => genCheckFlowStatus(flags.flow_path, file)
      .then((status) => ({
        file: file,
        status: status,
      }))
    )
  .then((statusEntries) => ({
    summary: summarizeReport(statusEntries),
    files: statusEntries,
  }));
}

function genReport(
  cwd: string,
  flags: Flags,
): Promise<Array<StatusEntry>> {
  return genSummarizedReport(cwd, flags)
    .then((report) => report.files);
}

function genFilesWithErrors(
  cwd: string,
  flags: Flags,
): Promise<ErrorReport> {
  const files = globsToFileList(cwd, flags.include, flags.exclude, {
    absolute: flags.absolute,
  });

  return genForceErrors(cwd, files, flags);
}

function coalesceReports(
  report: StatusReport,
  errorReport: ErrorReport,
): ValidationReport {
  return report.files.map((entry) => {
    const threwError = errorReport.indexOf(entry.file) >= 0;
    return {
      status: entry.status,
      threwError: threwError,
      isValid: isValidFlowStatus(entry.status, threwError),
      file: entry.file,
    };
  });
}

function genValidate(cwd: string, flags: Flags): Promise<ValidationReport> {
  return Promise.all([
    genSummarizedReport(cwd, flags),
    genFilesWithErrors(cwd, flags),
  ]).then(([report, errorReport]) => {
    return coalesceReports(report, errorReport);
  });
}

export default genReport;
export {genSummarizedReport, genCheckFlowStatus, genValidate};
