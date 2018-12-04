'use strict';

/**
 * @flow
 */

// $FlowFixMe: package.json is untyped
import packageJSON from '../package.json';
import {ArgumentParser} from 'argparse';
import {DEFAULT_FLAGS, OutputFormats, VisibleLevelTypes, VisibleStatusTypes} from './types';

function printDefault(value) {
  return `(default: '${JSON.stringify(value)}')`;
}

// flowlint-next-line unclear-type:off
export default function getParser(options?: Object = {}): ArgumentParser {
  const parser = new ArgumentParser({
    addHelp: true,
    version: packageJSON.version,
    ...options,
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
    ['--show-summary'],
    {
      action: 'storeTrue',
      help: `Include summary data. Does not apply to saved file output or jUnit output. ${printDefault(DEFAULT_FLAGS.show_summary)} `,
    },
  );
  parser.addArgument(
    ['--summary-only'],
    {
      action: 'storeTrue',
      help: `Unused. Switch to --show-summary instead.`,
    },
  );
  parser.addArgument(
    ['--list-files'],
    {
      action: 'store',
      help: `Filter the list of files based on the reported status. See '--level=flowweak' or '--allow-weak' to control when flow-weak files are included or excluded from the 'flow' or 'noflow' checks. ${printDefault(DEFAULT_FLAGS.list_files)}`,
      choices: VisibleStatusTypes,
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
    ['--json-file'],
    {
      action: 'store',
      help: `Save JSON output directly into JSON_FILE. ${printDefault(DEFAULT_FLAGS.json_file)} `,
    }
  );
  parser.addArgument(
    ['--summary-file'],
    {
      action: 'store',
      help: `Save a text-format summary of the report into SUMMARY_FILE. ${printDefault(DEFAULT_FLAGS.summary_file)} `,
    }
  );
  parser.addArgument(
    ['-a', '--absolute'],
    {
      action: 'storeTrue',
      help: `Report absolute path names. ${printDefault(DEFAULT_FLAGS.absolute)}`,
    },
  );
  parser.addArgument(
    ['--level'],
    {
      action: 'store',
      help: `The minimum strictness required in each file. Levels progress in ascending order through: 'any > weak > flow > strict-local > strict'. The program will exit 1 if any file has a level lower than this setting. ${printDefault(DEFAULT_FLAGS.level)}`,
      choices: VisibleLevelTypes,
    },
  );
  parser.addArgument(
    ['--allow-weak'],
    {
      action: 'storeTrue',
      help: `Alias for '--level=flowweak'. Consider '@flow weak' as an accepable annotation. See https://flowtype.org/docs/existing.html#weak-mode for reasons why this should only be used temporarily. ${printDefault(false)}`,
    },
  );
  parser.addArgument(
    ['--require-strict-local'],
    {
      action: 'storeTrue',
      help: `Alias for '--level=flowstrictlocal'. Consider '@flow strict-local' as the minimum allowable level. ${printDefault(false)}`,
    },
  );
  parser.addArgument(
    ['--require-strict'],
    {
      action: 'storeTrue',
      help: `Alias for '--level=flowstrict'. Consider '@flow strict' as the only accepable annotation. ${printDefault(false)}`,
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
      help: `Run in validation mode. This injects errors into globbed files and checks the flow-annotation status.`,
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
