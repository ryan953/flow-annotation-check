const args = require('args');
const path = require('path');
const flow = require('./flow');
const globsToFileList = require('./globsToFileList');
const {toArray} = require('./utils');

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

function main(command, sub, flags) {
  if (process.env.VERBOSE) {
    console.log('Invoked:', {command, sub, flags});
  }
  switch(command) {
    case 'validate':
      validate(sub, flags).then(printValidationReport);
      break;
    default:
      getReport(sub, flags).then(printStatusReport);
      break;
  }
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

(function() {
  let mainCommand;

  const setCommand = (command, sub, flags) => {
    mainCommand = command.shift();
    main(mainCommand, sub, flags);
  };

  args
    .option('absolute', 'Report absolute path names', false)
    .option(['i', 'include'], 'Glob for files to include', '**/*.js')
    .option(['x', 'exclude'], 'Glob of files to ignore', 'node_modules/**/*.js')
    .command('validate', 'Inject errors in files to validate status', setCommand, ['v']);
  const parsedFlags = args.parse(process.argv);
  if (!mainCommand) {
    main(mainCommand, args.sub, parsedFlags);
  }
})();
