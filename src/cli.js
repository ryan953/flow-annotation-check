'use strict';

/**
 * @flow
 */

import type {
  Args,
  Flags,
  OutputFormat,
  StatusReport,
  ValidationReport,
  VisibileStatusType,
} from './types';
import type {EntryFilter} from './flowStatusFilter';

import {DEFAULT_FLAGS} from './types';

import flowStatusFilter from './flowStatusFilter';
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
  asSummary as printStatusReportSummary,
} from './printStatusReport';


function getPackageJsonArgs(root: string, defaults: Flags): Flags {
  var pkg = loadPkg.sync(path.resolve(root || defaults.root));
  if (pkg && pkg['flow-annotation-check']) {
    return resolveArgs(pkg['flow-annotation-check'], defaults);
  }
  return defaults;
}

function resolveArgs(args: Args, defaults: Flags): Flags {
  return {
    validate: args.validate || defaults.validate, // flowlint-line sketchy-null-bool:off
    absolute: args.absolute || defaults.absolute, // flowlint-line sketchy-null-bool:off
    allow_weak: args.allow_weak || defaults.allow_weak, // flowlint-line sketchy-null-bool:off
    exclude: args.exclude || defaults.exclude,
    flow_path: args.flow_path || defaults.flow_path, // flowlint-line sketchy-null-string:off
    include: args.include || defaults.include,
    output: args.output || defaults.output,
    show_summary: args.show_summary || defaults.show_summary, // flowlint-line sketchy-null-bool:off
    list_files: args.list_files || defaults.list_files,
    html_file: args.html_file || defaults.html_file, // flowlint-line sketchy-null-string:off
    csv_file: args.csv_file || defaults.csv_file, // flowlint-line sketchy-null-string:off
    junit_file: args.junit_file || defaults.junit_file, // flowlint-line sketchy-null-string:off
    summary_file: args.summary_file || defaults.summary_file, // flowlint-line sketchy-null-string:off
    root: path.resolve(args.root || defaults.root), // flowlint-line sketchy-null-string:off
  };
}

function main(flags: Flags): void {
  const command = flags.validate ? 'validate' : 'report';

  if (process.env.VERBOSE) { // flowlint-line sketchy-null-string:off
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
          flags.html_file // flowlint-line sketchy-null-string:off
            ? saveReportToFile(flags.html_file, report, 'html-table')
            : null,
          flags.csv_file // flowlint-line sketchy-null-string:off
            ? saveReportToFile(flags.csv_file, report, 'csv')
            : null,
          flags.junit_file // flowlint-line sketchy-null-string:off
            ? saveReportToFile(flags.junit_file, report, 'junit')
            : null,
          flags.summary_file // flowlint-line sketchy-null-string:off
            ? saveReportToFile(flags.summary_file, report, 'summary')
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
  filename: string,
  report: StatusReport,
  output: OutputFormat,
) {
  if (process.env.VERBOSE) { // flowlint-line sketchy-null-string:off
    console.log(`Saving report as ${output} to ${filename}`);
  }
  return write(
    filename,
    getReport(report, output, true, flowStatusFilter('all', false)).join("\n")
  );
}

function getReport(
  report: StatusReport,
  output: OutputFormat,
  showSummary: boolean,
  filter: EntryFilter,
): Array<string> {
  switch (output) {
    case 'text':
      return printStatusReportAsText(report, showSummary, filter);
    case 'html-table':
      return printStatusReportAsHTMLTable(report, showSummary, filter);
    case 'csv':
      return printStatusReportAsCSV(report, showSummary, filter);
    case 'junit':
      return printStatusReportAsJUnit(report, filter);
    case 'summary':
      return printStatusReportSummary(report);
    default:
      throw new Error(`Invalid flag \`output\`. Found: ${JSON.stringify(output)}`);
  }
}

function printStatusReport(report: StatusReport, flags: Flags): StatusReport {
  getReport(
    report,
    flags.output,
    flags.show_summary,
    flowStatusFilter(
      flags.list_files,
      flags.allow_weak,
    ),
  ).map(
    (line) => console.log(line)
  );

  const noFlowFiles = report.filter((entry) => entry.status == 'no flow');
  const weakFlowFiles = report.filter((entry) => entry.status == 'flow weak');
  const failingFileCount = flags.allow_weak
    ? noFlowFiles.length
    : noFlowFiles.length + weakFlowFiles.length;
  process.exitCode = failingFileCount ? 1 : 0;

  return report;
}

function printValidationReport(report: ValidationReport, flags: Flags): void {
  if (process.env.VERBOSE) { // flowlint-line sketchy-null-string:off
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
      getPackageJsonArgs(parsed.root || '', DEFAULT_FLAGS),
    ),
  );
}

export {
  run,
  getParser,
  main,
  resolveArgs,
};
