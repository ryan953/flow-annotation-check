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

export const DEFAULT_FLAGS: Flags = {
  absolute: false,
  allow_weak: false,
  exclude: ['+(node_modules|build|flow-typed)/**/*.js'],
  flow_path: 'flow',
  include: ['**/*.js'],
  output: 'text',
  html_file: null,
  csv_file: null,
  junit_file: null,
  root: '.',
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
