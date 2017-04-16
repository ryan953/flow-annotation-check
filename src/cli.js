'use strict';

/**
 * @flow
 */

import type {Args, Flags, StatusReport, ValidationReport} from './types';

import packageJSON from '../package.json';
import path from 'path';
import {ArgumentParser} from 'argparse';
import genReport, {genValidate} from './flow-annotation-check';

function getParser(): ArgumentParser {
  const parser = new ArgumentParser({
    addHelp: true,
    version: packageJSON.version,
  });

  parser.addArgument(
    ['-f', '--flow-path'],
    {
      action: 'store',
      help: 'The path to the flow command. (default: `flow`)',
    },
  );
  parser.addArgument(
    ['-a', '--absolute'],
    {
      action: 'storeTrue',
      help: 'Report absolute path names. (default: false)',
    },
  );
  parser.addArgument(
    ['--allow-weak'],
    {
      action: 'storeTrue',
      help: 'Consider `@flow weak` as a accepable annotation. See https://flowtype.org/docs/existing.html#weak-mode for reasons why this should only be used temporarily. (default: false)',
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
      help: 'Glob for files to exclude. Can be set multiple times. (default: `+(node_modules|build|flow-typed)/**/*.js`)',
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
    exclude: args.exclude || ['+(node_modules|build|flow-typed)/**/*.js'],
    flow_path: args.flow_path || 'flow',
    include: args.include || ['**/*.js'],
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
      genValidate(flags.root, flags)
        .then((report) => printValidationReport(report, flags))
        .catch((error) => {
          console.log('Validate error:', error);
          process.exitCode = 2;
        });
      break;
    default:
      genReport(flags.root, flags)
        .then((report) => printStatusReport(report, flags))
        .catch((error) => {
          console.log('Report error:', error);
          process.exitCode = 2;
        });
      break;
  }
}


function printStatusReport(report: StatusReport, flags: Flags): void {
  report.forEach((entry) => {
    console.log(`${entry.status}\t${entry.file}`);
  });

  const noFlowFiles = report.filter((entry) => entry.status == 'no flow');
  const weakFlowFiles = report.filter((entry) => entry.status == 'flow weak');
  const failingFileCount = flags.allow_weak
    ? noFlowFiles.length
    : noFlowFiles.length + weakFlowFiles.length;
  process.exitCode = failingFileCount ? 1 : 0;
}

function printValidationReport(report: ValidationReport, flags: Flags): void {
  if (process.env.VERBOSE) {
    console.log('All Entries');
    report.forEach((entry) => {
      console.log(`${entry.isValid ? 'valid' : 'invalid'}\t${entry.file}`);
    });
    console.log('');
  }

  const invalidEntries = report.filter((entry) => !entry.isValid);
  if (invalidEntries.length > 0) {
    console.log('Invalid Entries');
    invalidEntries.forEach((entry) => {
      console.log(`${entry.isValid ? 'valid' : 'invalid'}\t${entry.status}\t${entry.threwError ? 'threw' : 'passed'}\t${entry.file}`);
    });
    process.exitCode = 1;
  }
  console.log('');
}

function run(): void {
  main(resolveArgs(getParser().parseArgs()));
}

export {
  run,
  getParser,
  main,
  resolveArgs,
};
