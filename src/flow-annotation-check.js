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

const {
  checkFlowStatus,
  countVisibleFiles,
  forceErrors,
} = require('./flow');
const globsToFileList = require('./globsToFileList');
const isValidFlowStatus = require('./isValidFlowStatus');

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
      return checkFlowStatus(file).then((status) => {
        entries.push({file, status});
        return entries;
      });
    };
  }), []);
}

function getFilesWithErrors(
  cwd: string,
  flags: Flags,
): Promise<ErrorReport> {
  const files = globsToFileList(cwd, flags.include, flags.exclude, {
    absolute: flags.absolute,
  });

  return forceErrors(cwd, files, flags);
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
  return countVisibleFiles(cwd)
    .then((files) => {
      if (files > 10000) {
        throw new Error(`You have ${files} which is too many!`);
      }
      return;
    })
    .catch((error) => {
      console.log('Validate error:', error);
      // exit 2
    })
    .then(() => Promise.all([
      genReport(cwd, flags),
      getFilesWithErrors(cwd, flags),
    ]))
    .then(([report, errorReport]) => {
      return coalesceReports(report, errorReport);
    });
}

function printStatusReport(report: StatusReport) {
  report.forEach((entry) => {
    console.log(`${entry.status}\t${entry.file}`);
  });

  // count non-flow files and return 1 if there are some
  // also add a flag to toggle between weak being valid/invalid
}

function printValidationReport(report: ValidationReport): void {
  if (process.env.VERBOSE) {
    console.log('All Entries');
    report.forEach((entry) => {
      console.log(`${entry.isValid ? 'valid' : 'invalid'}\t${entry.file}`);
    });
    console.log('');
  }

  console.log('Invalid Entries');
  const invalidEntries = report.filter((entry) => !entry.isValid);
  if (invalidEntries.length == 0) {
    console.log(' - none -');
    // exit 0
  } else {
    invalidEntries.forEach((entry) => {
      console.log(`${entry.isValid ? 'valid' : 'invalid'}\t${entry.status}\t${entry.threwError ? 'threw' : 'passed'}\t${entry.file}`);
    });
    // exit 1
  }
  console.log('');
}

module.exports = {
  genReport,
  getStatus: checkFlowStatus,
  printStatusReport,
  printValidationReport,
  validate: genValidate,
};
