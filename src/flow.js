'use strict';

/**
 * @flow
 */

import type {ErrorReport, Flags, FlowStatus} from './types';
import type {IOResult} from './promisified';

import {unique} from './core';
import {escapeShell, exec, execFile, stat, append, truncate} from './promisified';

type ASTComment = {
  type: 'Line' | 'Block' | string,
  value: string,
};
type AST = {
  comments: Array<ASTComment>,
};

type FlowCheckErrorMessage = {
  path: string,
};
type FlowCheckError = {
  kind: string,
  level: string,
  message: Array<FlowCheckErrorMessage>,
};
type FlowCheckResult = {
  errors?: Array<FlowCheckError>,
};

const FLOW_MODE = {
  FLOW_STRICT: 'flow strict',
  FLOW: 'flow',
  FLOW_WEAK: 'flow weak',
  NO_FLOW: 'no flow',
};

function astToFlowStatus(ast: AST): FlowStatus {
  for (let i = 0; i < 10; i++) {
    const comment = ast.comments[i];
    if (!comment) {
      return FLOW_MODE.NO_FLOW;
    }
    switch (comment.type) {
      case 'Line':
        const trimmedLine = comment.value.trim();
        if (trimmedLine === '@flow strict') {
          return FLOW_MODE.FLOW_STRICT;
        } else if (trimmedLine == '@flow weak') {
          return FLOW_MODE.FLOW_WEAK;
        } else if (trimmedLine === '@flow') {
          return FLOW_MODE.FLOW;
        }
        break;
      case 'Block':
        const lines = comment.value.split('\n').map((line) => {
          return line.trim().replace(/^\*/, '').trim();
        });
        if (lines.indexOf('@flow strict') >= 0) {
          return FLOW_MODE.FLOW_STRICT;
        } else if (lines.indexOf('@flow weak') >= 0) {
          return FLOW_MODE.FLOW_WEAK;
        } else if (lines.indexOf('@flow') >= 0) {
          return FLOW_MODE.FLOW;
        }
        break;
      default:
        throw new Error(`Unknown comment type ${comment.type} for comment ${JSON.stringify(comment)}`);
    }
  }
  return FLOW_MODE.NO_FLOW;
}

function genCheckFlowStatus(
  flowPath: string,
  file: string,
): Promise<FlowStatus> {
  const options = {maxBuffer: Infinity};

  return exec(`${flowPath} ast ${escapeShell(file)}`, options)
    .then(({stdout, stderr}): AST => {
      if (stderr) {
        throw new Error(stderr);
      }
      return JSON.parse(String(stdout));
    })
    .then(astToFlowStatus);
}

function genForceErrors(
  cwd: string,
  files: Array<string>,
  flags: Flags,
): Promise<ErrorReport> {
  const flowCheck = flags.absolute
    ? ['check', '--json', '--show-all-errors', cwd]
    : ['check', '--json', '--show-all-errors', '--strip-root', cwd]
  const options = {
    maxBuffer: Infinity,
  };
  const ERROR_STATEMENT = 'const FLOW_ANNOTATION_CHECK_INJECTED_ERROR: string = null;';

  return Promise.resolve(
    Promise.all(files.map((file) => append(file, ERROR_STATEMENT)))
      .then(() =>
        execFile(flags.flow_path, flowCheck, options)
          .then(({stdout, stderr}: IOResult) => JSON.parse(String(stdout)))
          .catch(({error, stdout, stderr}: IOResult) => {
            try {
              return JSON.parse(String(stdout));
            } catch (e) {
              return {};
            }
          })
      )
      .then((checkResult: FlowCheckResult) =>
        Promise.all(files.map((file) => truncate(file, ERROR_STATEMENT)))
        .then((_): ErrorReport => {
          return unique(
            (checkResult.errors || [])
              .reduce((paths, checkError) =>
                paths.concat(
                  checkError.message
                    .filter((message) => message.path)
                    .reduce((paths, message) => paths.concat(message.path), [])
                ), [])
          );
        })
      )
  );
}

export {
  genCheckFlowStatus,
  genForceErrors,
};
