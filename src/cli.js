'use strict';

const path = require('path');
const packageJSON = require('../package.json');

const {ArgumentParser} = require('argparse');

const {
  getReport,
  printStatusReport,
  printValidationReport,
  validate,
} = require('./flow-annotation-check');

function getParser() {
  const parser = new ArgumentParser({
    addHelp: true,
    version: packageJSON.version,
  });

  parser.addArgument(
    ['-a', '--absolute'],
    {
      action: 'storeTrue',
      help: 'Report absolute path names. (default: false)',
    },
  );
  parser.addArgument(
    ['-i', '--include'],
    {
      action: 'append',
      help: 'Glob for files to include. Can be set multiple times. (default: `**/*.js`)',
    },
  );
  parser.addArgument(
    ['-x', '--exclude'],
    {
      action: 'append',
      help: 'Glob for files to exclude. Can be set multiple times. (default: `node_modules/**/*.js`)',
    },
  );
  parser.addArgument(
    ['--validate'],
    {
      action: 'storeTrue',
      help: 'Run in validation mode. This injects errors into globbed files and checks the flow-annotation status',
    },
  );
  parser.addArgument(
    ['root'],
    {
      defaultValue: '.',
      help: 'The root directory to glob files from. (default: `.`)',
      nargs: '?',
    },
  );

  return parser;
}

function resolveArgs(args) {
  if (!args.include) {
    args.include = ['**/*.js'];
  }
  if (!args.exclude) {
    args.exclude = ['node_modules/**/*.js'];
  }
  args.root = path.resolve(args.root);

  return args;
}

function main(args) {
  const {
    validate,
    root,
    ...flags,
  } = args;

  const command = validate ? 'validate' : 'report';

  if (process.env.VERBOSE) {
    console.log('Invoking:', {command, root, flags});
  }

  switch(command) {
    case 'validate':
      validate(root, flags).then(printValidationReport);
      break;
    default:
      getReport(root, flags).then(printStatusReport);
      break;
  }
}

module.exports = {
  run() {
    main(resolveArgs(getParser().parseArgs()));
  },

  getParser,
  main,
  resolveArgs,
};
