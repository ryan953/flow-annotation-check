const path = require('path');
const flow = require('./flow');
const globsToFileList = require('./globsToFileList');
const isValidFlowStatus = require('./isValidFlowStatus');
const Promise = require('bluebird');

function getCWD(sub) {
  return path.resolve(sub[0] || '.');
}

function getReport(sub, flags) {
  const cwd = getCWD(sub);
  const files = globsToFileList(cwd, flags.include, flags.exclude, {
    absolute: flags.absolute,
  });

  return Promise.mapSeries(
    files,
    (file) => flow.checkFlowStatus(file).then((status) => ({
      file, status
    }))
  );
}

function getFilesWithErrors(sub, flags) {
  const cwd = getCWD(sub);
  const files = globsToFileList(cwd, flags.include, flags.exclude, {
    absolute: flags.absolute,
  });

  return flow.forceErrors(cwd, files, flags);
}

function coalesceReports(report, errorReport) {
  return report.map((entry) => {
    const threwError = errorReport.includes(entry.file);
    return {
      status: entry.status,
      threwError: threwError,
      isValid: isValidFlowStatus(entry.status, threwError),
      file: entry.file,
    };
  });

  return report;
}

function printStatusReport(report) {
  report.forEach((entry) => {
    console.log(`${entry.status}\t${entry.file}`);
  });
}

function printValidationReport(report) {
  if (process.env.VERBOSE) {
    console.log('All Entries');
    report.forEach((entry) => {
      console.log(`${entry.isValid}\t${entry.file}`);
    });
    console.log('');
  }

  console.log('Invalid Entries');
  const invalidEntries = report.filter((entry) => !entry.isValid);
  if (invalidEntries.length == 0) {
    console.log(' - none -');
  } else {
    invalidEntries.forEach((entry) => {
      console.log(`${entry.isValid}\t${entry.status}\t${entry.threwError}\t${entry.file}`);
    });
  }
  console.log('');
}

function validate(sub, flags) {
  const cwd = getCWD(sub);
  return flow.countVisibleFiles(cwd)
    .then((files) => {
      if (files > 10000) {
        console.log(`You have ${files} which is too many!`);
        return;
      }

      return Promise.all([
        getReport(sub, flags),
        getFilesWithErrors(sub, flags),
      ]);
    })
    .then(([report, errorReport]) => coalesceReports(report, errorReport));
}

module.exports = {
  getReport,
  printStatusReport,
  printValidationReport,
  validate,
};
