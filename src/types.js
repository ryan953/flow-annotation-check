/**
 * @flow
 */

export type OutputFormat = 'text' | 'html-table' | 'csv' | 'junit' | 'summary' | 'json';
export type VisibileStatusType = 'all' | 'noflow' | 'flowweak' | 'flow' | 'flowstrict' | 'flowstrictlocal' | 'none';

export type Level = 'any' | 'flowweak' | 'flow' | 'flowstrictlocal' | 'flowstrict';

export const OutputFormats = {
  text: 'text',
  'html-table': 'html-table',
  csv: 'csv',
  junit: 'junit',
  summary: 'summary',
  json: 'json',
};

export const VisibleLevelTypes: {[Level]: Level} = {
  any: 'any',
  flowweak: 'flowweak',
  flow: 'flow',
  flowstrictlocal: 'flowstrictlocal',
  flowstrict: 'flowstrict',
};

export const VisibleStatusTypes: {[VisibileStatusType]: VisibileStatusType} = {
  all: 'all',
  flow: 'flow',
  flowstrict: 'flowstrict',
  flowstrictlocal: 'flowstrictlocal',
  noflow: 'noflow',
  flowweak: 'flowweak',
  none: 'none',
};

export type Args = {
  validate?: boolean,
  absolute?: boolean,
  level?: Level,
  allow_weak?: boolean,
  require_strict_local?: boolean,
  require_strict?: boolean,
  exclude?: Array<string>,
  flow_path?: string,
  include?: Array<string>,
  output?: OutputFormat,
  show_summary?: boolean,
  list_files?: VisibileStatusType,
  html_file?: string,
  csv_file?: string,
  junit_file?: string,
  json_file?: string,
  summary_file?: string,
  root?: string,
};

export type Flags = {
  validate: boolean,
  absolute: boolean,
  level: Level,
  exclude: Array<string>,
  flow_path: string,
  include: Array<string>,
  output: OutputFormat,
  show_summary: boolean,
  list_files: VisibileStatusType,
  html_file: ?string,
  csv_file: ?string,
  junit_file: ?string,
  json_file: ?string,
  summary_file: ?string,
  root: string,
};

export const DEFAULT_FLAGS: Flags = {
  validate: false,
  absolute: false,
  level: 'flow',
  exclude: ['+(node_modules|build|flow-typed)/**/*.js'],
  flow_path: 'flow',
  include: ['**/*.js'],
  output: 'text',
  show_summary: false,
  list_files: 'all',
  html_file: null,
  csv_file: null,
  junit_file: null,
  json_file: null,
  summary_file: null,
  root: '.',
};

export type FlowStatus = 'flow strict' | 'flow strict-local' | 'flow' | 'flow weak' | 'no flow';

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

export type StatusReportSummary = {
  flow: number,
  flowstrict: number,
  flowstrictlocal: number,
  flowweak: number,
  noflow: number,
  total: number,
};

export type StatusReport = {
  summary: StatusReportSummary,
  files: Array<StatusEntry>,
};
export type ValidationReport = Array<ValidityEntry>;
export type ErrorReport = Array<string>;
