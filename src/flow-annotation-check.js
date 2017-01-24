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
  ValidationReport,
} from './types';

import globsToFileList from './globsToFileList';
import isValidFlowStatus from './isValidFlowStatus';
import {genCheckFlowStatus, genCountVisibleFiles, genForceErrors} from './flow';

function executeSequentially(promiseFactories, defaultValue) {
  let result = Promise.resolve(defaultValue);
  promiseFactories.forEach((promiseFactory) => {
    result = result.then(promiseFactory);
  });
  return result;
}

function genReport(
  cwd: string,
  flags: Flags,
): Promise<Array<StatusEntry>> {
  const files = globsToFileList(cwd, flags.include, flags.exclude, {
    absolute: flags.absolute,
  });

  return executeSequentially(files.map((file) => {
    return (entries) => {
      return genCheckFlowStatus(flags.flow_path, file).then((status) => {
        entries.push({file, status});
        return entries;
      });
    };
  }), []);
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
  return report.map((entry) => {
    const threwError = errorReport.includes(entry.file);
    return {
      status: entry.status,
      threwError: threwError,
      isValid: isValidFlowStatus(entry.status, threwError),
      file: entry.file,
    };
  });
}

function genValidate(cwd: string, flags: Flags): Promise<ValidationReport> {
  return genCountVisibleFiles(flags.flow_path, cwd)
    .then(() => Promise.all([
      genReport(cwd, flags),
      genFilesWithErrors(cwd, flags),
    ]))
    .then(([report, errorReport]) => {
      return coalesceReports(report, errorReport);
    });
}

module.exports = {
  genCheckFlowStatus,
  genReport,
  genValidate,
};
