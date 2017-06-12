'use strict';

/**
 * @flow
 */

import type {Args, Flags, OutputFormat, StatusReport, ValidationReport} from './types';
import {DEFAULT_FLAGS} from './types';

import genReport, {genValidate} from './flow-annotation-check';
import getParser from './parser';
import loadPkg from 'load-pkg';
import path from 'path';
import {write} from './promisified';
import {
  asText as printStatusReportAsText,
  asHTMLTable as printStatusReportAsHTMLTable,
  asCSV as printStatusReportAsCSV,
  asJUnit as printStatusReportAsJUnit,
} from './printStatusReport';


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
    output: args.output || defaults.output,
    html_file: args.html_file || defaults.html_file,
    csv_file: args.csv_file || defaults.csv_file,
    junit_file: args.junit_file || defaults.junit_file,
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
        .then((report) => Promise.all([
          flags.html_file
            ? saveReportToFile(flags.html_file, report, 'html-table')
            : null,
          flags.csv_file
            ? saveReportToFile(flags.csv_file, report, 'csv')
            : null,
          flags.junit_file
            ? saveReportToFile(flags.junit_file, report, 'junit')
            : null,
        ]))
        .catch((error) => {
          console.log('Report error:', error);
          process.exitCode = 2;
        });
      break;
  }
}

function saveReportToFile(
  filename:string,
  report: StatusReport,
  output: OutputFormat,
) {
  if (process.env.VERBOSE) {
    console.log(`Saving report as ${output} to ${filename}`);
  }
  return write(filename, getReport(report, output).join("\n"));
}

function getReport(report: StatusReport, output: OutputFormat): Array<string> {
  switch (output) {
    case 'text':
      return printStatusReportAsText(report);
    case 'html-table':
      return printStatusReportAsHTMLTable(report);
    case 'csv':
      return printStatusReportAsCSV(report);
    case 'junit':
      return printStatusReportAsJUnit(report);
    default:
      throw new Error(`Invalid flag \`output\`. Found: ${JSON.stringify(output)}`);
  }
}

function printStatusReport(report: StatusReport, flags: Flags): StatusReport {
  getReport(report, flags.output).map((line) => console.log(line));

  const noFlowFiles = report.filter((entry) => entry.status == 'no flow');
  const weakFlowFiles = report.filter((entry) => entry.status == 'flow weak');
  const failingFileCount = flags.allow_weak
    ? noFlowFiles.length
    : noFlowFiles.length + weakFlowFiles.length;
  process.exitCode = failingFileCount ? 1 : 0;

  return report;
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
