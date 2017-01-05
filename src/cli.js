'use strict';

const args = require('args');
const path = require('path');

const {
  getReport,
  printStatusReport,
  printValidationReport,
  validate,
} = require('./flow-annotation-check');

function main(command, sub, flags) {
  if (process.env.VERBOSE) {
    console.log('Invoked:', {command, sub, flags});
  }
  const cwd = path.resolve(sub[0] || '.');
  switch(command) {
    case 'validate':
      validate(cwd, flags).then(printValidationReport);
      break;
    default:
      console.log('Running report', sub, flags);
      getReport(cwd, flags).then(printStatusReport);
      break;
  }
}

module.exports = {
  run() {
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
  }
};

