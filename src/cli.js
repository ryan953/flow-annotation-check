'use strict';

/**
 * @flow
 */

import type {Args, Flags, StatusReport, ValidationReport} from './types';

import genReport, {genValidate} from './flow-annotation-check';
import loadPkg from 'load-pkg';
import packageJSON from '../package.json';
import path from 'path';
import {ArgumentParser} from 'argparse';

const DEFAULT_FLAGS = {
  absolute: false,
  allow_weak: false,
  exclude: ['+(node_modules|build|flow-typed)/**/*.js'],
  flow_path: 'flow',
  include: ['**/*.js'],
  root: '.',
};

function printDefault(value) {
  return `(default: \`${JSON.stringify(value)}\`)`;
}

function getParser(): ArgumentParser {
  const parser = new ArgumentParser({
    addHelp: true,
    version: packageJSON.version,
  });

  parser.addArgument(
    ['-f', '--flow-path'],
    {
      action: 'store',
      help: `The path to the flow command. ${printDefault(DEFAULT_FLAGS.flow_path)}`,
    },
  );
  parser.addArgument(
    ['-a', '--absolute'],
    {
      action: 'storeTrue',
      help: `Report absolute path names. ${printDefault(DEFAULT_FLAGS.absolute)}`,
    },
  );
  parser.addArgument(
    ['--allow-weak'],
    {
      action: 'storeTrue',
      help: `Consider \`@flow weak\` as a accepable annotation. See https://flowtype.org/docs/existing.html#weak-mode for reasons why this should only be used temporarily. ${printDefault(DEFAULT_FLAGS.allow_weak)}`,
    },
  );
  parser.addArgument(
    ['-i', '--include'],
    {
      action: 'append',
      help: `Glob for files to include. Can be set multiple times. ${printDefault(DEFAULT_FLAGS.include)}`,
    },
  );
  parser.addArgument(
    ['-x', '--exclude'],
    {
      action: 'append',
      help: `Glob for files to exclude. Can be set multiple times. ${printDefault(DEFAULT_FLAGS.exclude)}`,
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
      help: `The root directory to glob files from. ${printDefault(DEFAULT_FLAGS.root)}`,
      nargs: '?',
    },
  );

  return parser;
}

function getPackageJsonArgs(root: ?string, defaults: Flags): Flags {
  var pkg = loadPkg.sync(path.resolve(root || defaults.root));
  if (pkg && pkg['flow-annotation-check']) {
    return resolveArgs(pkg['flow-annotation-check'], defaults);
  }
  return defaults;
}

function resolveArgs(args: Args, defaults: Flags): Flags {
  return {
    absolute: args.absolute || defaults.absolute,
    allow_weak: args.allow_weak || defaults.allow_weak,
    exclude: args.exclude || defaults.exclude,
    flow_path: args.flow_path || defaults.flow_path,
    include: args.include || defaults.include,
    root: path.resolve(args.root || defaults.root),
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
  const parsed = getParser().parseArgs();
  main(
    resolveArgs(
      parsed,
      getPackageJsonArgs(parsed.root, DEFAULT_FLAGS),
    ),
  );
}

export {
  run,
  getParser,
  main,
  resolveArgs,
};
