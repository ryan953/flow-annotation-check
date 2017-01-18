/**
 * @flow
 */

export type Args = {
  absolute?: boolean,
  exclude?: Array<string>,
  include?: Array<string>,
  root?: string,
};

export type Flags = {
  absolute: boolean,
  exclude: Array<string>,
  include: Array<string>,
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
