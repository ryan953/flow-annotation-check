'use strict';

/**
 * @flow
 */

import type {Args, Flags, StatusReport, ValidationReport} from './types';

import packageJSON from '../package.json';
import path from 'path';
import {ArgumentParser} from 'argparse';
import {genReport, validate} from './flow-annotation-check';

function getParser(): ArgumentParser {
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

function resolveArgs(args: Args): Flags {
  return {
    ...args,
    include: args.include || ['**/*.js'],
    exclude: args.exclude || ['node_modules/**/*.js'],
    root: path.resolve(args.root || '.'),
  };
}

function main(flags: Flags): void {
  const command = flags.validate ? 'validate' : 'report';

  if (process.env.VERBOSE) {
    console.log('Invoking:', {command, flags});
  }

  switch(command) {
    case 'validate':
      validate(flags.root, flags).then(printValidationReport);
      break;
    default:
      genReport(flags.root, flags).then(printStatusReport);
      break;
  }
}


function printStatusReport(report: StatusReport): void {
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
  run(): void {
    main(resolveArgs(getParser().parseArgs()));
  },

  getParser,
  main,
  resolveArgs,
};
