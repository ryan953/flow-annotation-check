'use strict';

/**
 * @flow
 */

import packageJSON from '../package.json';
import {ArgumentParser} from 'argparse';
import {DEFAULT_FLAGS, OutputFormats} from './types';

function printDefault(value) {
  return `(default: \`${JSON.stringify(value)}\`)`;
}

export default function getParser(): ArgumentParser {
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
    ['-o', '--output'],
    {
      action: 'store',
      help: `Output format for status/filename pairs. ${printDefault(DEFAULT_FLAGS.output)} `,
      choices: OutputFormats,
    },
  );
  parser.addArgument(
    ['--summary-only'],
    {
      action: 'storeTrue',
      help: `Output just the summary data, skipping the long list of files. Does not apply to saved file output. ${printDefault(DEFAULT_FLAGS.summary_only)} `,
    },
  );
  parser.addArgument(
    ['--html-file'],
    {
      action: 'store',
      help: `Save the html table output directly into HTML_FILE. ${printDefault(DEFAULT_FLAGS.html_file)} `,
    },
  );
  parser.addArgument(
    ['--csv-file'],
    {
      action: 'store',
      help: `Save CSV output directly into CSV_FILE. ${printDefault(DEFAULT_FLAGS.csv_file)} `,
    },
  );
  parser.addArgument(
    ['--junit-file'],
    {
      action: 'store',
      help: `Save jUnit output directly into JUNIT_FILE. ${printDefault(DEFAULT_FLAGS.junit_file)} `,
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
