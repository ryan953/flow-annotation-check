/**
 * @flow
 */

export type OutputFormat = 'text' | 'html-table' | 'csv' | 'junit';
export const OutputFormats = {
  text: 'text',
  'html-table': 'html-table',
  csv: 'csv',
  junit: 'junit',
};

export type Args = {
  absolute?: boolean,
  allow_weak?: boolean,
  exclude?: Array<string>,
  flow_path?: string,
  include?: Array<string>,
  output?: OutputFormat,
  html_file?: string,
  csv_file?: string,
  junit_file?: string,
  root?: string,
};

export type Flags = {
  absolute: boolean,
  allow_weak: boolean,
  exclude: string | Array<string>,
  flow_path: string,
  include: string | Array<string>,
  output: OutputFormat,
  html_file: ?string,
  csv_file: ?string,
  junit_file: ?string,
  root: string,
};

export type FlowStatus = 'flow' | 'flow weak' | 'no flow';

export type StatusEntry = {
  file: string,
  status: FlowStatus,
};

export type ValidityEntry = {
  file: string,
  isValid: boolean,
  status: FlowStatus,
  threwError: boolean,
};

export type StatusReport = Array<StatusEntry>;
export type ValidationReport = Array<ValidityEntry>;
export type ErrorReport = Array<string>;
