'use strict';

/**
 * @flow
 */

import type {Args, Flags} from './types';

import packageJSON from '../package.json';
import path from 'path';
import {ArgumentParser} from 'argparse';
import {
  genReport,
  printStatusReport,
  printValidationReport,
  validate,
} from './flow-annotation-check';

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

module.exports = {
  run(): void {
    main(resolveArgs(getParser().parseArgs()));
  },

  getParser,
  main,
  resolveArgs,
};
